import './download.type'
import getOptions from '../options/model'
import * as path from 'path'

/**
 * The name of the directory that files are downloaded into
 */
let directoryName = 'manaba'

/**
 * The number of files that are downloaded at the same time.
 */
let limit = 5

/**
 * An item stack that has pending files.
 */
const pendingStack: [chrome.downloads.DownloadOptions, DownloadContext][] = []

/**
 * An item stack that has downloading files.
 */
const downloadingStack: Map<number, DownloadContext> = new Map()

/**
 * An item stack that has files interrupted from downloading.
 */
const interruptedStack: [DownloadContext, string][] = []

/**
 * An item stack that has files completed downloading.
 */
const completedStack: DownloadContext[] = []

/**
 * Start downloading an item and move it from `pendingStack` to `downloadingStack` if the count of `downloadingStack` is under `limit`.
 */
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

/**
 * The callback function for the downloading event.
 * @param delta The info about changed properties in `DownloadItem`
 */
const downloadCallback = async function (
  delta: chrome.downloads.DownloadDelta
) {
  // If the downloading state is not changed...
  if (typeof delta.state === 'undefined') {
    return
  }

  // If the event is not own...
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

  // Next download
  requestDownload()
}

/**
 * The regex to replace illegal strings in the filename.
 */
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

/**
 * Replace illegal strings in a token for a valid path.
 * @param token The token replaced
 * @returns Replaced string
 */
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

/**
 * Push an item to the pending stack for downloading.
 * @param context The item
 */
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

/**
 * Return items from some stacks.
 * @returns downloading: items copied from a stack that has items in downloading
 * @returns interrupted: items pop from a stack that has items interrupted from downloading
 * @returns completed: items pop from a stack that has items completed downloading
 * @returns isEmpty: true if the count of items pending or downloading is 0, otherwise false
 */
export const takeStacks = function () {
  // Move items.
  const downloading = Array.from(downloadingStack.values())
  const interrupted = interruptedStack.splice(0)
  const completed = completedStack.splice(0)
  const isEmpty = pendingStack.length === 0 && downloadingStack.size === 0

  return { downloading, interrupted, completed, isEmpty }
}

/**
 * Clear the pending stack and cancel items from downloading.
 */
export const cancelDownload = async function () {
  pendingStack.splice(0)
  for (const downloadId of downloadingStack.keys()) {
    await chrome.downloads.cancel(downloadId)
  }
}
