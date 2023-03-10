import getOptions from '../options/models'

const createInputFragment = function (
  key: string,
  item?: OptionItem,
  type = item.type,
  hint = item.hint,
  description = item.description
) {
  const fragment = document.createDocumentFragment()

  const label = document.createElement('label')
  label.className = 'unselectable'
  label.innerHTML = hint

  const input = document.createElement('input')
  input.id = key
  input.type = type
  input.placeholder = hint
  input.alt = description
  if (item !== null && 'value' in item) {
    input.value = item.value as string
  }
  label.appendChild(input)

  fragment.append(label)

  const descriptionDiv = document.createElement('div')
  descriptionDiv.className = 'description'
  descriptionDiv.innerHTML = description
  fragment.appendChild(descriptionDiv)

  return fragment
}

const createCollectionFragment = function (
  key: string,
  item: OptionCollectionItem
) {
  const fragment = document.createDocumentFragment()

  const tempDiv = document.createElement('div')
  tempDiv.id = key
  tempDiv.innerHTML = item.hint + '<br>' + item.value.join('<br>')
  fragment.appendChild(tempDiv)

  console.info('Not Implementation: ', item)

  return fragment
}

const createRadioFragment = function (key: string, item: OptionRadioItem) {
  const fragment = document.createDocumentFragment()

  const hintDiv = document.createElement('div')
  hintDiv.className = 'hint'
  hintDiv.innerHTML = item.hint
  fragment.appendChild(hintDiv)

  const descriptionDiv = document.createElement('div')
  descriptionDiv.className = 'description'
  descriptionDiv.innerHTML = item.description
  fragment.appendChild(descriptionDiv)

  const buttonsDiv = document.createElement('div')
  buttonsDiv.id = key

  for (const choice of item.choices) {
    const subFragment = createInputFragment(
      null,
      null,
      'radio',
      choice.hint,
      choice.description
    )
    const input = subFragment.querySelector('input')
    input.name = key
    input.value = choice.key
    input.checked = item.value === choice.key

    buttonsDiv.appendChild(subFragment)
  }

  fragment.appendChild(buttonsDiv)

  return fragment
}

const createItemElement = function (key: string, item: OptionItem) {
  const container = document.createElement('div')
  container.className = 'item'
  container.setAttribute('type', item.type)

  let fragment: DocumentFragment

  switch (item.type) {
    case 'checkbox': {
      const checkboxItem = item as OptionCheckboxItem
      fragment = createInputFragment(key, item)

      const input = fragment.querySelector('input')
      input.checked = checkboxItem.value
      break
    }
    case 'collection': {
      fragment = createCollectionFragment(key, item as OptionCollectionItem)
      break
    }
    case 'number': {
      const numberItem = item as OptionNumberItem
      fragment = createInputFragment(key, item)

      const input = fragment.querySelector('input')
      input.min = numberItem.min?.toString()
      input.max = numberItem.max?.toString()
      break
    }
    case 'radio': {
      fragment = createRadioFragment(key, item as OptionRadioItem)
      break
    }
    default: {
      fragment = createInputFragment(key, item)
      break
    }
  }

  container.appendChild(fragment)

  return container
}

const createSectionElement = function (key: string, title: string) {
  const container = document.createElement('div')
  container.id = key
  container.className = 'section'

  const titleH2 = document.createElement('h2')
  titleH2.innerHTML = title
  container.appendChild(titleH2)

  return container
}

const initializeConstraint = function (
  element: HTMLElement,
  dependencyId?: string
) {
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

  element.disabled = !dependency.checked !== isInverted
}

// Entry point
export default async function () {
  const { options, sections, items } = await getOptions()

  // Get the holder to insert option sections and items to.
  const holder = document.querySelector('#options-holder')

  const rootTitleH1 = document.createElement('h1')
  rootTitleH1.innerHTML = options.title
  holder.appendChild(rootTitleH1)

  // Add option sections.
  const sectionStack: [OptionSection, Element][] = [[options, holder]]
  while (sectionStack.length > 0) {
    const [section, parent] = sectionStack.pop()

    for (const { key, node } of section.children) {
      let child: Element

      if (node.isSection) {
        // If `item` is a section, add section element.
        const subSection = node as OptionSection
        child = createSectionElement(key, subSection.title)
        sectionStack.push([subSection, child])
      } else {
        // If `item` is a item, add item element.
        child = createItemElement(key, node as OptionItem)
      }

      parent.appendChild(child)
    }
  }

  // Initialize constraints.
  for (const [key, section] of sections) {
    const element = document.getElementById(key)
    element?.querySelectorAll('input').forEach(function (element) {
      initializeConstraint(element, section.dependency)
    })
  }
  for (const [key, item] of items) {
    const element = document.getElementById(key)
    initializeConstraint(element, item.dependency)
  }
}
