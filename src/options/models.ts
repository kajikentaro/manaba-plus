import options from './models.json'
import './models.type'

// Indicate if the options are initialized and available.
let isInitialized = false

const initialize = async function () {
  // Flatten option items.
  const items = new Map<string, OptionItem>()

  const sectionStack: [OptionSection] = [options]
  while (sectionStack.length) {
    const section = sectionStack.pop()

    const keys = Object.keys(section).slice(1)

    for (const key of keys) {
      const item: OptionSection | OptionItem = section[key]

      // If `item` is a section...
      if ('title' in item) {
        sectionStack.push(item)
      } else {
        if ('value' in item) {
          item._value = item.value
        }

        items.set(key, item)
      }
    }
  }

  // Get stored values.
  const pairs = await chrome.storage.sync.get([...items.keys()])

  for (const key in pairs) {
    items.get(key)._value = pairs[key]
  }

  // Add setter in items.
  for (const [key, item] of items) {
    Object.defineProperty(item, 'value', {
      get() {
        const _item: OptionItem = this
        return _item._value
      },
      set(value) {
        const _item: OptionItem = this
        if (_item._value !== value) {
          _item._value = value
          chrome.storage.sync.set({ [key]: value })
        }
      },
    })
  }

  isInitialized = true

  console.log(options)
}

export default async function () {
  if (!isInitialized) {
    await initialize()
  }

  return options
}
