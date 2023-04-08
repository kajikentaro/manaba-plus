import getOptions from '../options/model'
import { messages, pushMessages } from '../utils/messages'

let url: string

/**
 * Transition to another page.
 */
const transition = async function (event?: Event) {
  if (typeof event === 'undefined') {
    const { options } = await getOptions()

    if (options['main-panel'].messages['notify-timeout'].value) {
      pushMessages(messages.timeout)
    }
  }

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
    // To avoid looping in login sessions.
    setTimeout(transition, options.timeout['transition-delay-time'].value)
  } else if (options.common['allow-changing'].value) {
    // Add a button.
    const transitionInput = document.createElement('input')
    transitionInput.id = 'transition-button'
    transitionInput.type = 'button'
    transitionInput.value = options.timeout['timeout-button-label'].value
    transitionInput.addEventListener('click', transition)
    document.body.appendChild(transitionInput)
  }
})
