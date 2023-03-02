import consts from '../consts'
import getOptions from '../options/models'
import { messages, pushMessages } from '../messages'

let url = consts['home-url']

const transition = function () {
  window.location.href = url
}

getOptions().then(async function (options) {
  const customRrl = options.timeout['destination-on-timeout'].value.trim()
  if (customRrl) {
    url = customRrl
  }

  if (options.timeout['transition-automatically'].value) {
    await pushMessages(messages.timeout)
    transition()
  } else {
    // Add a button.
    const containerDiv = document.createElement('div')
    containerDiv.className = 'container'

    const transitionInput = document.createElement('input')
    transitionInput.type = 'button'
    transitionInput.value = options.timeout['timeout-button-label'].value
    transitionInput.addEventListener('click', transition)
    containerDiv.appendChild(transitionInput)

    containerDiv.appendChild(transitionInput)

    const content = document.querySelector('#content')
    content.appendChild(containerDiv)
  }
})
