import consts from '../consts'
import getOptions from './models'

// Get option path from current URL query params.
const url = new URL(location.href)
const optionPath = url.searchParams.get('path')

console.error('Not Implementation: ' + optionPath)

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
    itemInput.addEventListener('input', (e) => {
      item.value = (e.target as HTMLInputElement).checked
    })
  } else {
    itemInput.value = item.value
    itemInput.addEventListener('input', (e) => {
      item.value = (e.target as HTMLInputElement).value
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

getOptions().then((options) => {
  // Get the holder to insert option sections and items to.
  const holder = document.querySelector('#options-holder')

  const rootTitleH1 = document.createElement('h1')
  rootTitleH1.innerHTML = options.title
  holder.appendChild(rootTitleH1)

  // Add option sections.
  const sectionQueue = [[options, holder]]
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

      ;(parent as Element).appendChild(child)
    }
  }

  // Add button actions.
  document
    .querySelector('#download-contents')
    ?.addEventListener('click', (e) => {
      window.open('../contents/index.html')
    })

  document
    .querySelector('#delete-history')
    ?.addEventListener('click', async (e) => {
      if (!confirm(options.contents['delete-history'].description)) {
        return
      }

      console.error(
        'Not Implementation: ' + consts['storage-key']['contents-history']
      )
      await chrome.storage.local.remove(
        consts['storage-key']['contents-history']
      )
      alert(options.contents['delete-history'].message)
    })

  document
    .querySelector('#reset-options')
    ?.addEventListener('click', async (e) => {
      if (!confirm(options.other['reset-options'].description)) {
        return
      }

      await chrome.storage.sync.clear()
      location.reload()
      alert(options.other['reset-options'].message)
    })

  // Add constraint actions.
  document.querySelector('#allow-changing').addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement
    const allowChanging = target.checked

    target
      .closest('.section')
      .querySelectorAll<HTMLElement>('[id|="show"]')
      .forEach((element) => {
        if (allowChanging) {
          element.removeAttribute('disabled')
        } else {
          element.setAttribute('disabled', '')
        }
      })
  })
})
