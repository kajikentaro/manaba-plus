import * as PathModule from 'path'
import { FileInfo } from './type'

const downloadFile: (
  file: FileInfo,
  onDownloadStart: (downloadId: number) => void
) => Promise<void> = async (file, onDownloadStart) => {
  const fileName = decodeURI(file.url.match('.+/(.+?)([?#;].*)?$')[1])
  const filePath = PathModule.join(
    'Manaba',
    file.courseName.replace('/', '-'),
    file.contentName.replace('/', '-'),
    fileName.replace('/', '-')
  )
  const downloadId = await chrome.downloads.download({
    url: file.url,
    filename: filePath,
    saveAs: false,
  })

  if (typeof downloadId === 'undefined') {
    return Promise.reject(new Error(''))
  }
  onDownloadStart(downloadId)
  await waitForComplete(downloadId)
}

const waitForComplete: (downloadId: number) => Promise<void> = (downloadId) => {
  return new Promise((resolve, reject) => {
    const callback: (downloadDelta: chrome.downloads.DownloadDelta) => void = (
      downloadDelta
    ) => {
      if (downloadId !== downloadDelta.id) return
      if (typeof downloadDelta.state === 'undefined') return
      if (downloadDelta.state.current === 'interrupted') {
        reject(downloadDelta.error || new Error())
        chrome.downloads.onChanged.removeListener(callback)
      }
      if (downloadDelta.state.current === 'complete') {
        resolve()
        chrome.downloads.onChanged.removeListener(callback)
      }
    }
    chrome.downloads.onChanged.addListener(callback)
  })
}

export default downloadFile
