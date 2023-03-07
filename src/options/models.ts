import options from './models.json'
import './models.type'

const sections = new Map<string, OptionSection>()
const items = new Map<string, OptionItem>()

// Indicate if the options are initialized and available.
let isInitialized = false

const initialize = async function () {
  // Flatten option sections and items.
  sections.set('', options)

  const sectionStack: [OptionSection] = [options]
  while (sectionStack.length > 0) {
    const section = sectionStack.pop()
    section.isSection = true

    Object.defineProperty(section, 'children', {
      get(): { key: string; node: OptionNode }[] {
        // Anyway skip `title`.
        let skipCount = 1

        // If `dependency` was defined, skip it, too.
        if (typeof section.dependency !== 'undefined') {
          skipCount++
        }

        // Exclude `isSection`.
        // Don't care about 'children' because it is not enumerable as default.
        const keys = Object.keys(section).slice(skipCount, -1)
        return keys.map(function (key) {
          return { key, node: section[key] }
        })
      },
    })

    for (const { key, node } of section.children) {
      // If `node` is a section...
      if ('title' in node) {
        const subSection = node as OptionSection

        sectionStack.push(subSection)
        sections.set(key, subSection)
      } else {
        node.isSection = false

        const item = node as OptionItem

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
}

export default async function () {
  if (!isInitialized) {
    await initialize()
  }

  return { options, sections, items }
}
