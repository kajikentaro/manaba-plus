import { currentTraces, getContents } from './scrape'
import * as insert from './insert'
import * as notify from './notify'
import * as history from './history'
import { sha256 } from 'hash'
import { takeFinished, reserveDownload } from './download'

const startButton = document.querySelector('#start-button')
const cancelButton = document.querySelector('#cancel-button')
if (startButton === null || cancelButton === null) {
  console.error('Undefined')
}

let isDownloadStopped = true

const startDownload = async function () {
  if (!isDownloadStopped) {
    return
  }

  isDownloadStopped = false

  startButton.setAttribute('disabled', '')
  cancelButton.removeAttribute('disabled')

  notify.hideMessages()

  console.log('Contents: Downloading...')

  const exclusionList = await history.getHistory()
  const addExclusion = function (context: DownloadContext) {
    if ('hash' in context && typeof context.hash === 'string') {
      exclusionList.add(context.hash)
    }
  }

  const progressTimer = setInterval(function () {
    insert.updateProgress(currentTraces)
    console.log('Progress: Updated!')
  }, 500)

  const downloadTimer = setInterval(function () {
    const { interrupted, completed, isEmpty } = takeFinished()

    completed.forEach(addExclusion)

    insert.appendFinished(interrupted, completed)

    if (!isDownloadStopped || !isEmpty) {
      return
    }

    // If completely finished downloading...

    startButton.removeAttribute('disabled')

    console.log('Contents: Downloaded!')

    history.setHistory(exclusionList)

    clearInterval(downloadTimer)
  }, 500)

  for await (const content of getContents()) {
    if (isDownloadStopped) {
      break
    }

    // Skip dummy data.
    if (content === null) {
      continue
    }

    const { url, tokens } = content
    const hash = await sha256(url)

    if (exclusionList.has(hash)) {
      continue
    }

    const context = { url, tokens, hash }
    reserveDownload(context)
  }

  cancelButton.setAttribute('disabled', '')

  clearInterval(progressTimer)

  if (isDownloadStopped) {
    console.log('Contents: Canceled!')

    notify.showCanceledMessage()
  } else {
    console.log('Contents: Collected!')

    insert.clearProgress()
    notify.showCompletedMessage()
  }

  isDownloadStopped = true
}

const cancelDownload = async function () {
  cancelButton.setAttribute('disabled', '')

  isDownloadStopped = true
}

// Entry point
export default function () {
  startButton.addEventListener('click', startDownload)
  cancelButton.addEventListener('click', cancelDownload)
}
