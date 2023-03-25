import getOptions from '../options/model'
import { messages, pushMessages } from '../utils/messages'

let url: string

/**
 * Transition to another page.
 */
const transition = function () {
  window.location.href = url
}

// Entry point
getOptions().then(async function ({ options }) {
  const customRrl = options.timeout['destination-on-timeout'].value.trim()
  if (customRrl === '') {
    // Set the home page URL.
    url = options.common['root-url'].value + 'home'
  } else {
    url = customRrl
  }

  if (options.timeout['transition-automatically'].value) {
    if (options['main-panel'].messages['notify-timeout'].value) {
      await pushMessages(messages.timeout)
    }

    // To avoid looping in login sessions.
    setTimeout(transition, 500)
  } else {
    // Add a button.
    const transitionInput = document.createElement('input')
    transitionInput.id = 'transition-button'
    transitionInput.type = 'button'
    transitionInput.value = options.timeout['timeout-button-label'].value
    transitionInput.addEventListener('click', transition)
    document.body.appendChild(transitionInput)
  }
})
