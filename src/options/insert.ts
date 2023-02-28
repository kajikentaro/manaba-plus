import getOptions from '../options/models'

const createItemElement = (
  key: string,
  item: OptionItem,
  frame: HTMLElement
) => {
  frame.classList.add('item')

  const itemLabel = document.createElement('label')
  itemLabel.className = 'imselectable'
  itemLabel.innerHTML = item.hint
  frame.appendChild(itemLabel)

  const itemInput = document.createElement('input')
  itemInput.id = key
  itemInput.placeholder = item.hint
  itemInput.alt = item.description

  const type = (itemInput.type = item.type)
  switch (type) {
    case 'button': {
      const buttonItem = item as OptionButtonItem
      itemInput.value = buttonItem.value
      itemInput.addEventListener('input', (event) => {
        const element = event.target as HTMLInputElement
        buttonItem.value = element.value
      })
      break
    }
    case 'checkbox': {
      const checkboxItem = item as OptionCheckboxItem
      itemInput.checked = checkboxItem.value
      itemInput.addEventListener('input', (event) => {
        const element = event.target as HTMLInputElement
        checkboxItem.value = element.checked
      })
      break
    }
    case 'collection': {
      const collectionItem = item as OptionCollectionItem
      console.info('Not Implementation: ', collectionItem)
      break
    }
  }

  itemLabel.appendChild(itemInput)

  const descriptionDiv = document.createElement('div')
  descriptionDiv.className = 'description'
  descriptionDiv.innerHTML = item.description
  frame.appendChild(descriptionDiv)
}

const createSectionElement = (title: string, frame: HTMLElement) => {
  frame.classList.add('section')

  const titleH2 = document.createElement('h2')
  titleH2.innerHTML = title
  frame.appendChild(titleH2)
}

// Entry point
export default async () => {
  const options = await getOptions()

  // Get the holder to insert option sections and items to.
  const holder = document.querySelector('#options-holder')

  const rootTitleH1 = document.createElement('h1')
  rootTitleH1.innerHTML = options.title
  holder.appendChild(rootTitleH1)

  // Add option sections.
  const sectionQueue: [OptionSection, Element][] = [[options, holder]]
  while (sectionQueue.length) {
    const [section, parent] = sectionQueue.pop()

    const keys = Object.keys(section).slice(1)

    for (const key of keys) {
      const item: OptionSection | OptionItem = section[key]

      const child = document.createElement('div')

      if ('title' in item) {
        // If `item` is a section, add section element.
        createSectionElement(item.title, child)
        sectionQueue.push([item, child])
      } else {
        // If `item` is a item, add item element.
        createItemElement(key, item, child)
      }

      parent.appendChild(child)
    }
  }
}
