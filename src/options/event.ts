import getOptions from '../options/models'
import consts from '../consts'
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

      console.error(
        'Not Implementation: ' + consts['storage-key']['contents-history']
      )
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
  document
    .querySelector('#allow-changing')
    ?.addEventListener('input', function (event) {
      const target = event.target as HTMLInputElement
      const allowChanging = target.checked

      target
        .closest('.section')
        .querySelectorAll<HTMLElement>('[id|="show"]')
        .forEach(function (element) {
          if (allowChanging) {
            element.removeAttribute('disabled')
          } else {
            element.setAttribute('disabled', '')
          }
        })
    })
}
