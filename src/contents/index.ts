import { getLastDate } from 'notification/download'
import event from './event'

// Entry point.
event()
;(async function () {
  // Show the last download date.
  const lastDownloadDate = document.querySelector('#last-download-date')
  if (lastDownloadDate !== null) {
    const lastDate = await getLastDate()
    if (lastDate === null) {
      return
    }

    lastDownloadDate.textContent = new Date(lastDate).toLocaleString()
  }
})()
