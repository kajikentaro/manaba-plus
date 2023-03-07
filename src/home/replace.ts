import { fetchDOM } from 'fetch'

const replaceContentBody = function () {
  const mycourse = document.querySelector('.my-course')

  const contentBody = document.createElement('div')
  contentBody.id = 'content-body'
  contentBody.className = 'two-columns'

  const contentbodyLeft = document.querySelector('.contentbody-left')
  contentbodyLeft.className = 'left'
  contentBody.appendChild(contentbodyLeft)

  const contentbodyRight = document.querySelector('.contentbody-right')
  contentbodyRight.className = 'right'
  contentBody.appendChild(contentbodyRight)

  mycourse.appendChild(contentBody)
}

const starRegex = /(.+_)(set|unset)(_.+)$/

const replaceStar = function (anchor: HTMLAnchorElement) {
  const match = starRegex.exec(anchor.href)
  const components = match.slice(1)
  let isStared = match[2] === 'unset'

  const child = document.createElement('img')
  child.className = 'star'
  child.src = '../icon_clip_on.png'
  if (isStared) {
    child.setAttribute('stared', '')
  }
  child.addEventListener('click', async function (event) {
    event.stopPropagation()

    child.setAttribute('in-progress', '')

    components[1] = isStared ? 'unset' : 'set'
    const url = components.join()
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
  const newElement = document.createElement('div')
  newElement.className = 'status'

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
    newElement.appendChild(newChild)
  }

  if (typeof registrationState !== 'undefined') {
    newElement.appendChild(registrationState)
  }

  element.replaceWith(newElement)

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

const replaceYearAndRemarks = function (element: HTMLElement) {
  // Extract year and remarks from `innerText`.
  const match = /(\d{4})(.*)/.exec(element.innerText)
  const year = match[1]
  const remarks = match[2].trim()

  const yearDiv = document.createElement('div')
  yearDiv.className = 'year'
  yearDiv.innerText = year

  const periodDiv = document.createElement('div')
  periodDiv.className = 'remarks'
  periodDiv.innerText = remarks

  element.replaceWith(yearDiv, periodDiv)
}

const replaceBanners = function () {
  const bannerList = document.querySelector('.banner-list')
  const anchors = bannerList.querySelectorAll('a')
  bannerList.replaceChildren(...anchors)
}

// Entry point
export default function () {
  replaceContentBody()

  document.querySelectorAll('.course').forEach(function (element) {
    const courseAnchor = element.querySelector<HTMLAnchorElement>('.title')
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

  document
    .querySelectorAll('.courseitemdetail:first-of-type')
    .forEach(replaceYearAndRemarks)

  replaceBanners()
}
