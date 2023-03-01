import './download.type'
import getOptions from '../options/models'
import * as path from 'path'

let directoryName = 'manaba'
let limit = 5

const pendingStack: [chrome.downloads.DownloadOptions, DownloadContext][] = []
const inProgressStack: Map<number, DownloadContext> = new Map()
const interruptedStack: [DownloadContext, string][] = []
const completedStack: DownloadContext[] = []

const requestDownload = async function () {
  if (inProgressStack.size >= limit) {
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
    const message =
      chrome.runtime.lastError.message ?? 'Could not start downloading...'
    interruptedStack.push([context, message])
    return
  }

  inProgressStack.set(downloadId, context)
}

const downloadCallback = async function (
  delta: chrome.downloads.DownloadDelta
) {
  if (typeof delta.state === 'undefined') {
    return
  }

  const context = inProgressStack.get(delta.id)
  if (typeof context === 'undefined') {
    return
  }

  inProgressStack.delete(delta.id)

  switch (delta.state.current) {
    case 'interrupted': {
      const items = await chrome.downloads.search({
        id: delta.id,
      })

      const message = items[0].error ?? 'Downloading failed for some reason...'
      interruptedStack.push([context, message])
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
getOptions().then(function (options) {
  directoryName = options.contents['directory-name'].value
  directoryName = preprocessToken(directoryName)

  limit = options.contents['download-limit'].value

  setInterval(requestDownload, 1000)
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

export const takeFinished = function () {
  // Move items.
  const interrupted = interruptedStack.splice(0)
  const completed = completedStack.splice(0)
  const isEmpty = pendingStack.length === 0 && inProgressStack.size === 0

  return { interrupted, completed, isEmpty }
}
