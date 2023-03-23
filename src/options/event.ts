import getOptions from '../options/model'
import { clearHistory } from '../contents/history'

const addConstraint = function (element: HTMLElement, dependencyId?: string) {
  if (element === null || !('disabled' in element)) {
    return
  }

  if (typeof dependencyId === 'undefined') {
    return
  }

  const isInverted = dependencyId.startsWith('!')
  if (isInverted) {
    dependencyId = dependencyId.slice(1)
  }

  const dependency = document.getElementById(dependencyId)
  if (dependency === null || !('checked' in dependency)) {
    return
  }

  document
    .getElementById(dependencyId)
    ?.addEventListener('input', function (event) {
      const dependency = event.target as HTMLInputElement
      element.disabled = !dependency.checked !== isInverted
    })
}

const addBindings = async function () {
  const { sections, items } = await getOptions()

  for (const [key, section] of sections) {
    const element = document.getElementById(key)
    element?.querySelectorAll('input').forEach(function (element) {
      addConstraint(element, section.dependency)
    })
  }
  for (const [key, item] of items) {
    const element = document.getElementById(key)
    addConstraint(element, item.dependency)

    if (element === null || !('value' in item)) {
      continue
    }

    switch (item.type) {
      case 'button': {
        break
      }
      case 'checkbox': {
        element.addEventListener('input', function (event) {
          const input = event.target as HTMLInputElement
          item.value = input.checked
        })
        break
      }
      case 'collection': {
        break
      }
      case 'radio': {
        element.querySelectorAll('input').forEach(function (input) {
          input.addEventListener('input', function (event) {
            const input = event.target as HTMLInputElement
            if (input.checked) {
              item.value = input.value
            }
          })
        })
        break
      }
      default: {
        element.addEventListener('input', function (event) {
          const input = event.target as HTMLInputElement
          item.value = input.value
        })
        break
      }
    }
  }
}

const addButtonActions = async function () {
  const { options } = await getOptions()

  const actions = [
    {
      selectors: '#revert-removed-assignments',
      message: options['main-panel']['revert-removed-assignments'].description,
      action: async function () {
        options['main-panel']['removed-assignments'].value = null
        location.reload()
      },
    },
    {
      selectors: '#revert-removed-courses',
      message: options.home['revert-removed-courses'].description,
      action: async function () {
        options.home['removed-courses'].value = null
        location.reload()
      },
    },
    {
      selectors: '#download-contents',
      message: null,
      action: () => window.open('../contents/index.html'),
    },
    {
      selectors: '#delete-history',
      message: options.contents['delete-history'].description,
      action: () => clearHistory(),
    },
    {
      selectors: '#reset-options',
      message: options.other['reset-options'].description,
      action: async function () {
        await chrome.storage.sync.clear()
        location.reload()
      },
    },
  ]

  for (const { selectors, message, action } of actions) {
    document
      .querySelector(selectors)
      ?.addEventListener('click', async function () {
        if (message !== null && !confirm(message)) {
          return
        }

        action()
      })
  }
}

// Entry point
export default async function () {
  await addBindings()
  await addButtonActions()
}
