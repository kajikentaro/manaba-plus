import './download.type'
import getOptions from '../options/model'
import * as path from 'path'

let directoryName = 'manaba'
let limit = 5

const pendingStack: [chrome.downloads.DownloadOptions, DownloadContext][] = []
const downloadingStack: Map<number, DownloadContext> = new Map()
const interruptedStack: [DownloadContext, string][] = []
const completedStack: DownloadContext[] = []

export const requestDownload = async function () {
  if (downloadingStack.size >= limit) {
    return
  }

  if (pendingStack.length === 0) {
    return
  }

  const [options, context] = pendingStack.pop()

  let downloadId: number
  try {
    downloadId = await chrome.downloads.download(options)
  } catch (error) {
    interruptedStack.push([context, error])
    return
  }

  if (typeof downloadId === 'undefined') {
    const error = chrome.runtime.lastError.message ?? 'COULD_NOT_START'
    interruptedStack.push([context, error])
    return
  }

  downloadingStack.set(downloadId, context)
}

const downloadCallback = async function (
  delta: chrome.downloads.DownloadDelta
) {
  if (typeof delta.state === 'undefined') {
    return
  }

  const context = downloadingStack.get(delta.id)
  if (typeof context === 'undefined') {
    return
  }

  downloadingStack.delete(delta.id)

  switch (delta.state.current) {
    case 'interrupted': {
      const items = await chrome.downloads.search({
        id: delta.id,
      })

      const error = items[0].error ?? 'FAILED'
      interruptedStack.push([context, error])
      break
    }
    case 'complete': {
      completedStack.push(context)
      break
    }
  }

  requestDownload()
}

const invalidRegex = /[<>:"/\\|?*~]| - \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\s*$/g
const replaceDictionary = new Map([
  ['<', '['],
  ['>', ']'],
  [':', '-'],
  ['"', "'"],
  ['/', '-'],
  ['\\', '-'],
  ['|', ' '],
  ['?', ' '],
  ['*', ' '],
  ['~', '-'],
])

const preprocessToken = function (token: string) {
  return token
    .replaceAll(invalidRegex, function (match) {
      const replacement = replaceDictionary.get(match)
      if (typeof replacement === 'undefined') {
        return ''
      }

      return replacement
    })
    .trim()
}

// Entry point
getOptions().then(function ({ options }) {
  directoryName = options.contents['directory-name'].value
  directoryName = preprocessToken(directoryName)

  limit = options.contents['download-limit'].value

  // setInterval(requestDownload, 1000)
  chrome.downloads.onChanged.addListener(downloadCallback)
})

export const reserveDownload = async function (context: DownloadContext) {
  let filename: string
  if (directoryName) {
    const preprocessedTokens = context.tokens.map((token) =>
      preprocessToken(token)
    )
    preprocessedTokens.reverse()

    filename = path.join(preprocessToken(directoryName), ...preprocessedTokens)
  }

  pendingStack.push([{ url: context.url, filename, saveAs: false }, context])
}

export const takeStacks = function () {
  // Move items.
  const downloading = Array.from(downloadingStack.values())
  const interrupted = interruptedStack.splice(0)
  const completed = completedStack.splice(0)
  const isEmpty = pendingStack.length === 0 && downloadingStack.size === 0

  return { downloading, interrupted, completed, isEmpty }
}

export const cancelDownload = async function () {
  pendingStack.splice(0)
  for (const downloadId of downloadingStack.keys()) {
    await chrome.downloads.cancel(downloadId)
  }
}
