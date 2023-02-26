import consts from '../consts'

export default (options) => {
  // Add button actions.
  document
    .querySelector('#download-contents')
    ?.addEventListener('click', (_) => {
      window.open('../contents/index.html')
    })

  document
    .querySelector('#delete-history')
    ?.addEventListener('click', async (_) => {
      if (!confirm(options.contents['delete-history'].description)) {
        return
      }

      console.error(
        'Not Implementation: ' + consts['storage-key']['contents-history']
      )
      await chrome.storage.local.remove(
        consts['storage-key']['contents-history']
      )
      alert(options.contents['delete-history'].message)
    })

  document
    .querySelector('#reset-options')
    ?.addEventListener('click', async (_) => {
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
    ?.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement
      const allowChanging = target.checked

      target
        .closest('.section')
        .querySelectorAll<HTMLElement>('[id|="show"]')
        .forEach((element) => {
          if (allowChanging) {
            element.removeAttribute('disabled')
          } else {
            element.setAttribute('disabled', '')
          }
        })
    })
}
