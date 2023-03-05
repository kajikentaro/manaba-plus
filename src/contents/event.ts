import * as scrape from './scrape'
import * as insert from './insert'
import * as notify from './notify'
import * as history from './history'
import { sha256 } from 'hash'
import * as download from './download'

const startButton = document.querySelector('#start-button')
const cancelButton = document.querySelector('#cancel-button')

let isDownloadStopped = true

const preventClosing = function (event: Event) {
  event.preventDefault()
  event.returnValue = false
  return false
}

const startDownload = async function () {
  if (!isDownloadStopped) {
    return
  }

  isDownloadStopped = false

  startButton.setAttribute('disabled', '')
  cancelButton.removeAttribute('disabled')

  notify.hideMessages()

  const exclusionList = await history.getHistory()
  const addExclusion = function (context: DownloadContext) {
    if ('hash' in context && typeof context.hash === 'string') {
      exclusionList.add(context.hash)
    }
  }

  window.addEventListener('beforeunload', preventClosing, false)

  const progressTimer = setInterval(
    insert.updateProgress,
    500,
    scrape.currentTraces
  )

  const downloadTimer = setInterval(async function () {
    await download.requestDownload()
    const { interrupted, completed, isEmpty } = download.takeFinished()

    completed.forEach(addExclusion)

    insert.appendFinished(interrupted, completed)

    if (!isDownloadStopped || !isEmpty) {
      return
    }

    // If completely finished downloading...

    startButton.removeAttribute('disabled')

    history.setHistory(exclusionList)

    window.removeEventListener('beforeunload', preventClosing, false)

    clearInterval(downloadTimer)
  }, 1000)

  await scrape.startScraping(async function (content) {
    const { url, tokens } = content
    const hash = await sha256(url)

    if (exclusionList.has(hash)) {
      return
    }

    const context = { url, tokens, hash }
    download.reserveDownload(context)
  })

  cancelButton.setAttribute('disabled', '')

  clearInterval(progressTimer)

  if (isDownloadStopped) {
    notify.showCanceledMessage()
  } else {
    insert.clearProgress()
    notify.showCompletedMessage()
  }

  isDownloadStopped = true
}

const cancelDownload = async function () {
  scrape.stopScraping()

  cancelButton.setAttribute('disabled', '')

  isDownloadStopped = true
}

// Entry point
export default function () {
  startButton.addEventListener('click', startDownload)
  cancelButton.addEventListener('click', cancelDownload)

  document
    .querySelector('#test-button')
    .addEventListener('click', async function () {
      console.info('TODO: speed up')
      const last = performance.now()
      const cs = []
      await scrape.startScraping(function (c) {
        cs.push(c)
        console.log(c)
      })
      console.warn(cs)
      const now = performance.now()
      console.warn(now - last, 'ms')
    })
}
