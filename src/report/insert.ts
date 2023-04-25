// ENtry point
export default function () {
  const button = document.querySelector('.file-upload-button')
  if (button === null) {
    return
  }

  const formMessages = document.createElement('div')
  formMessages.id = 'form-messages'
  button.insertAdjacentElement('afterend', formMessages)
}
