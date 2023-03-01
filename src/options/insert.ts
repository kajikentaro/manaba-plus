import getOptions from '../options/models'

const createItemElement = function (
  key: string,
  item: OptionItem,
  frame: HTMLElement
) {
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
      break
    }
    case 'checkbox': {
      const checkboxItem = item as OptionCheckboxItem
      itemInput.checked = checkboxItem.value
      itemInput.addEventListener('input', function (event) {
        const element = event.target as HTMLInputElement
        checkboxItem.value = element.checked
      })
      break
    }
    case 'collection': {
      const collectionItem = item as OptionCollectionItem

      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = collectionItem.value.join('<br>')
      frame.appendChild(tempDiv)

      console.info('Not Implementation: ', collectionItem)
      break
    }
    case 'number': {
      const numberItem = item as OptionNumberItem
      itemInput.value = numberItem.value.toString()
      itemInput.addEventListener('input', function (event) {
        const element = event.target as HTMLInputElement
        numberItem.value = parseFloat(element.value)
      })
      break
    }
    case 'text': {
      const textItem = item as OptionTextItem
      itemInput.value = textItem.value
      itemInput.addEventListener('input', function (event) {
        const element = event.target as HTMLInputElement
        textItem.value = element.value
      })
      break
    }
  }

  itemLabel.appendChild(itemInput)

  const descriptionDiv = document.createElement('div')
  descriptionDiv.className = 'description'
  descriptionDiv.innerHTML = item.description
  frame.appendChild(descriptionDiv)
}

const createSectionElement = function (title: string, frame: HTMLElement) {
  frame.classList.add('section')

  const titleH2 = document.createElement('h2')
  titleH2.innerHTML = title
  frame.appendChild(titleH2)
}

// Entry point
export default async function () {
  const options = await getOptions()

  // Get the holder to insert option sections and items to.
  const holder = document.querySelector('#options-holder')

  const rootTitleH1 = document.createElement('h1')
  rootTitleH1.innerHTML = options.title
  holder.appendChild(rootTitleH1)

  // Add option sections.
  const sectionStack: [OptionSection, Element][] = [[options, holder]]
  while (sectionStack.length) {
    const [section, parent] = sectionStack.pop()

    const keys = Object.keys(section).slice(1)

    for (const key of keys) {
      const item: OptionSection | OptionItem = section[key]

      const child = document.createElement('div')

      if ('title' in item) {
        // If `item` is a section, add section element.
        createSectionElement(item.title, child)
        sectionStack.push([item, child])
      } else {
        // If `item` is a item, add item element.
        createItemElement(key, item, child)
      }

      parent.appendChild(child)
    }
  }
}
