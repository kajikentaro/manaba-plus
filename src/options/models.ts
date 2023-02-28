import options from './models.json'

export default async () => {
  // Flatten option items.
  const items = {}

  const sectionQueue = [options]
  while (sectionQueue.length) {
    const section = sectionQueue.pop()

    const keys = Object.keys(section).slice(1)

    for (const key of keys) {
      const item = section[key]

      // If `item` is a section...
      if ('title' in item) {
        sectionQueue.push(item)
      } else {
        items[key] = item
      }
    }
  }

  // Get stored values.
  const pairs = await chrome.storage.sync.get(Object.keys(items))

  for (const key in pairs) {
    items[key].value = pairs[key]
  }

  // Add setter in items.
  for (const key in items) {
    const item = items[key]

    item._value = item.value
    Object.defineProperty(item, 'value', {
      get() {
        return this._value
      },
      set(value) {
        if (this._value !== value) {
          this._value = value
          chrome.storage.sync.set({ [key]: value })
        }
      },
    })
  }

  console.log(options)
  return options
}
