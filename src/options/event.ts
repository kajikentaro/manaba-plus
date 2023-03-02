import getOptions from '../options/models'
import { clearHistory } from 'contents/history'

export default async function () {
  const options = await getOptions()

  // Add button actions.
  document
    .querySelector('#download-contents')
    ?.addEventListener('click', function () {
      window.open('../contents/index.html')
    })

  document
    .querySelector('#delete-history')
    ?.addEventListener('click', async function () {
      if (!confirm(options.contents['delete-history'].description)) {
        return
      }

      await clearHistory()
      alert(options.contents['delete-history'].message)
    })

  document
    .querySelector('#reset-options')
    ?.addEventListener('click', async function () {
      if (!confirm(options.other['reset-options'].description)) {
        return
      }

      await chrome.storage.sync.clear()
      location.reload()
      alert(options.other['reset-options'].message)
    })

  // Add constraint actions.
  // const showElements = document.querySelectorAll('#home [id|="show"]')
  // document
  //   .querySelector('#allow-changing')
  //   ?.addEventListener('input', function (event) {
  //     const element = event.target as HTMLInputElement

  //     if (element.checked) {
  //       for (const showElement of showElements) {
  //         showElement.removeAttribute('disabled')
  //       }
  //     }
  //     else {
  //       for (const showElement of showElements) {
  //         showElement.setAttribute('disabled', '')
  //       }
  //     }
  //   })

  // const timeoutButtonLabel = document.querySelector('#timeout-button-label')
  // document
  //   .querySelector('#transition-automatically')
  //   ?.addEventListener('input', function (event) {
  //     const element = event.target as HTMLInputElement

  //     if (element.checked) {
  //       timeoutButtonLabel.setAttribute('disabled', '')
  //     }
  //     else {
  //       timeoutButtonLabel.removeAttribute('disabled')
  //     }
  //   })
}
