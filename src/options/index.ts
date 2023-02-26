import getOptions from './models'
import addEventListeners from './event'

// Get option path from current URL query params.
const url = new URL(location.href)
const optionPath = url.searchParams.get('path')

console.info('Not Implementation: ' + optionPath)

const createItemElement = (key: string, item, child: HTMLElement) => {
  child.className = 'item'

  const itemLabel = document.createElement('label')
  itemLabel.innerHTML = item.hint
  child.appendChild(itemLabel)

  const itemInput = document.createElement('input')
  itemInput.id = key
  itemInput.placeholder = item.hint
  itemInput.title = item.description
  const type = (itemInput.type = item.type)
  if (type === 'checkbox') {
    itemInput.checked = item.value
    itemInput.addEventListener('input', (event) => {
      item.value = (event.target as HTMLInputElement).checked
    })
  } else {
    itemInput.value = item.value
    itemInput.addEventListener('input', (event) => {
      item.value = (event.target as HTMLInputElement).value
    })
  }
  itemLabel.appendChild(itemInput)

  const descriptionDiv = document.createElement('div')
  descriptionDiv.className = 'description'
  descriptionDiv.innerHTML = item.description
  child.appendChild(descriptionDiv)
}

const createSectionElement = (child: HTMLElement, title: string) => {
  child.className = 'section'

  const titleH1 = document.createElement('h1')
  titleH1.innerHTML = title
  child.appendChild(titleH1)
}

// Entry point.
getOptions().then((options) => {
  // Get the holder to insert option sections and items to.
  const holder = document.querySelector('#options-holder')

  const rootTitleH1 = document.createElement('h1')
  rootTitleH1.innerHTML = options.title
  holder.appendChild(rootTitleH1)

  // Add option sections.
  const sectionQueue: [any, Element][] = [[options, holder]]
  while (sectionQueue.length) {
    const [section, parent] = sectionQueue.pop()

    const keys = Object.keys(section).slice(1)

    for (const key of keys) {
      const item = section[key]

      const child = document.createElement('div')

      const title = item.title
      if (title === undefined) {
        // If `item` is a item, add item element.
        createItemElement(key, item, child)
      } else {
        // If `item` is a section, add section element.
        createSectionElement(child, title)

        sectionQueue.push([item, child])
      }

      parent.appendChild(child)
    }
  }

  addEventListeners(options)
})
