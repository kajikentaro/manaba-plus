import { fetchDOM } from 'fetch'

const starRegex = /(.+)_(set|unset)___$/

const replaceStar = function (anchor: HTMLAnchorElement) {
  const match = starRegex.exec(anchor.href)
  const urlBase = match[1]
  let isStared = match[2] === 'unset'

  const child = document.createElement('img')
  child.classList.add('course-star')
  child.src = '../icon_clip_on.png'
  if (isStared) {
    child.setAttribute('stared', '')
  }
  child.addEventListener('click', async function (event) {
    event.stopPropagation()

    child.setAttribute('in-progress', '')

    const url = `${urlBase}_${isStared ? 'unset' : 'set'}___`
    const response = await fetch(url)

    if (response.ok) {
      isStared = !isStared
      child.toggleAttribute('stared')
      child.removeAttribute('in-progress')
    }
  })
  anchor.replaceWith(child)
}

const statusSuffix = [
  '_news',
  '',
  '_grade',
  '_topics',
  '_coursecollection_user',
]

const replaceStatus = function (element: Element, courseUrl: string) {
  element.className = 'status'

  const children = Array.from(element.children)

  let registrationState: Element
  if (children[0].className === 'registration-state') {
    registrationState = children.shift()
  }

  const newChildren: HTMLAnchorElement[] = []

  for (let index = 0; index < children.length; index++) {
    const newChild = document.createElement('a')
    newChild.href = courseUrl + statusSuffix[index]
    newChild.appendChild(children[index])
    newChildren.push(newChild)
  }

  element.replaceChildren(...newChildren)

  if (typeof registrationState !== 'undefined') {
    element.appendChild(registrationState)
  }

  // Set assignment link.
  const img = children[1] as HTMLImageElement
  if (img.src.endsWith('off.png')) {
    return
  }

  fetchDOM(courseUrl).then(function (doc) {
    const menus = doc.querySelectorAll(
      '.course-menu-query, .course-menu-report, .course-menu-survey'
    )
    for (const menu of menus) {
      const counter = menu.querySelector('.my-unreadcount')
      if (counter === null) {
        continue
      }

      const type = counter.id.replace('status', '')
      newChildren[1].href = `${courseUrl}_${type}`
      break
    }
  })
}

export default function () {
  document
    .querySelectorAll('.course-cell, .courselist-c, .coursecard')
    .forEach(function (element) {
      const courseAnchor = element.querySelector<HTMLAnchorElement>(
        'a:not([href^="home_fav"])'
      )
      if (courseAnchor === null) {
        return
      }

      const courseUrl = courseAnchor.href

      const starAnchor = element.querySelector<HTMLAnchorElement>(
        'a[href^="home_fav"]'
      )
      if (starAnchor !== null) {
        replaceStar(starAnchor)
      }

      const status = element.querySelector('.coursestatus, .course-card-status')
      if (status !== null) {
        replaceStatus(status, courseUrl)
      }
    })
}
