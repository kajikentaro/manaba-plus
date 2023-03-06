import * as scrape from './scrape'
import * as insert from './insert'
import * as notify from './notify'
import * as history from './history'
import { sha256 } from 'hash'
import * as download from './download'

const startButton = document.querySelector('#start-button')
const cancelButton = document.querySelector('#cancel-button')
const testButton = document.querySelector('#test-button')

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
  let isCanceled = true

  startButton.setAttribute('disabled', '')
  cancelButton.removeAttribute('disabled')

  insert.clearProgress()
  insert.clearContents()
  notify.hideMessages()

  window.addEventListener('beforeunload', preventClosing, false)

  const exclusionList = await history.getHistory()
  const addExclusion = function (context: ContentContext) {
    exclusionList.add(context.hash)
  }

  const progressTimer = setInterval(function () {
    insert.updateProgress(scrape.currentTraces)
  }, 500)

  const downloadTimer = setInterval(async function () {
    await download.requestDownload()
    const stacks = download.takeStacks()

    stacks.completed.forEach(addExclusion)

    insert.updateContents(stacks)

    if (!isDownloadStopped || !stacks.isEmpty) {
      return
    }

    // If completely finished downloading...

    clearInterval(downloadTimer)

    history.setHistory(exclusionList)

    window.removeEventListener('beforeunload', preventClosing, false)

    if (isCanceled) {
      notify.showCanceledMessage()
    } else {
      notify.showCompletedMessage()
    }

    startButton.removeAttribute('disabled')
  }, 1000)

  await scrape.startScraping(async function (context: ContentContext) {
    context.hash = await sha256(context.url)
    context.excluded = exclusionList.has(context.hash)

    insert.appendContent(context)

    if (context.excluded) {
      return
    }

    download.reserveDownload(context)
  })

  clearInterval(progressTimer)

  isCanceled = isDownloadStopped
  if (!isCanceled) {
    insert.clearProgress()
  }

  isDownloadStopped = true
}

const cancelDownload = async function () {
  cancelButton.setAttribute('disabled', '')

  scrape.stopScraping()
  await download.cancelDownload()

  isDownloadStopped = true
}

const testScraping = async function () {
  testButton.setAttribute('disabled', '')

  console.info('TODO: speed up')
  const last = performance.now()
  await scrape.startScraping(function (context: ContentContext) {
    insert.appendContent(context)
  })
  const now = performance.now()
  console.warn(now - last, 'ms')

  testButton.removeAttribute('disabled')
}

// Entry point
export default function () {
  startButton.addEventListener('click', startDownload)
  cancelButton.addEventListener('click', cancelDownload)
  testButton.addEventListener('click', testScraping)
}
