import { fetchDOM } from '../utils/fetch'
import '../extension/element'

const replaceContentBody = function () {
  const mycourse = document.querySelector('.my-course')

  const contentBody = document.createElement('div')
  contentBody.id = 'content-body'

  const contentbodyLeft = document.querySelector('.contentbody-left')
  contentbodyLeft.className = 'left'
  contentBody.appendChild(contentbodyLeft)

  const contentbodyRight = document.querySelector('.contentbody-right')
  contentbodyRight.className = 'right'
  contentBody.appendChild(contentbodyRight)

  mycourse.appendChild(contentBody)
}

const getContent = function (
  source: Element | { parent: Element; selectors: string },
  className: string,
  tagName = 'div',
  attributeNames: string | string[] = 'innerText'
) {
  if (!(source instanceof Element)) {
    const { parent, selectors } = source
    source = parent.querySelector(selectors)
  }

  if (source === null) {
    return null
  }

  const target = document.createElement(tagName)
  target.className = className

  if (typeof attributeNames === 'string') {
    attributeNames = [attributeNames]
  }

  for (const attributeName of attributeNames) {
    if (attributeName in source && attributeName in target) {
      const attribute = source[attributeName]
      target[attributeName] = attribute
    }
  }

  return target
}

const statusSuffix = [
  '_news',
  '',
  '_grade',
  '_topics',
  '_coursecollection_user',
]

const getTitleAndStatus = function (course: Element) {
  const anchor = getContent(
    {
      parent: course,
      selectors:
        '.course-cell a:first-of-type, .courselist-title a, .course-card-title a',
    },
    '',
    'a',
    ['href', 'innerText']
  ) as HTMLAnchorElement
  if (anchor === null) {
    return { title: null, status: null }
  }

  const courseUrl = anchor.href

  const title = document.createElement('div')
  title.className = 'title'
  title.appendChild(anchor)

  const pastStatus = course.querySelector('.coursestatus, .course-card-status')
  if (pastStatus === null) {
    return { title, status: null }
  }

  const children = Array.from(pastStatus.children)

  let linkState: Element = getContent(
    {
      parent: course,
      selectors: 'span[style]',
    },
    'link-state'
  )
  if (children[0].className === 'registration-state') {
    linkState = children.shift()
    linkState.className = 'link-state'
  }
  linkState?.joinIn(title)

  const status = document.createElement('div')
  status.className = 'status'

  const newChildren: HTMLAnchorElement[] = []

  for (let index = 0; index < children.length; index++) {
    const newChild = document.createElement('a')
    newChild.href = courseUrl + statusSuffix[index]
    newChild.appendChild(children[index])
    newChildren.push(newChild)
    status.appendChild(newChild)
  }

  // Set assignment link.
  const img = children[1] as HTMLImageElement
  if (img.src.endsWith('on.png')) {
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

  return { title, status }
}

const starRegex = /(.+_)(set|unset)(_.+)$/

const getStar = function (course: Element) {
  const starAnchor = course.querySelector<HTMLAnchorElement>(
    'a[href^="home_fav"]'
  )
  if (starAnchor === null) {
    return null
  }

  const star = document.createElement('div')
  star.className = 'star'

  const match = starRegex.exec(starAnchor.href)

  star.setAttribute('url-part-1', match[1])
  star.setAttribute('url-part-3', match[3])

  if (match[2] === 'unset') {
    star.setAttribute('stared', '')
  }

  return star
}

const getComponents = function (course: Element) {
  const { title, status } = getTitleAndStatus(course)
  const star = getStar(course)

  const actions = document.createElement('div')
  actions.className = 'actions'
  star?.joinIn(actions)

  return { title, actions, status }
}

const getYearAndRemarks = function (course: Element) {
  const element = course.querySelector<HTMLElement>(
    '.courseitemdetail:first-of-type'
  )

  // Extract year and remarks from `innerText`.
  const match = /(\d{4})(.*)/.exec(element.innerText)
  const yearStr = match[1]
  const remarksStr = match[2].trim()

  const year = document.createElement('div')
  year.className = 'year'
  year.innerText = yearStr

  const remarks = document.createElement('div')
  remarks.className = 'remarks'
  remarks.innerText = remarksStr

  return { year, remarks }
}

const replaceCourses = function () {
  // #region cell type
  document.querySelectorAll('.course-cell').forEach(function (pastCourse) {
    const { title, actions, status } = getComponents(pastCourse)

    const cell = document.createElement('td')

    const course = document.createElement('div')
    course.className = 'course cell'
    title?.joinIn(course)
    course.appendChild(actions)
    status?.joinIn(course)

    cell.appendChild(course)

    pastCourse.replaceWith(cell)
  })
  // #endregion

  // #region row type
  document
    .querySelectorAll('.courselist-c, .courselist-r')
    .forEach(function (pastCourse) {
      const { title, actions, status } = getComponents(pastCourse)

      const year = pastCourse.children[1]
      year.classList.add('year')

      const teachers = pastCourse.children[3]
      teachers.classList.add('teachers')

      const icon = getContent(
        {
          parent: pastCourse,
          selectors: 'img.inline',
        },
        'icon',
        'img',
        'src'
      )

      const remarks = getContent(pastCourse.children[2], 'remarks', 'td')

      const course = document.createElement('tr')
      course.className = 'course row'

      const titleCell = course.insertCell()
      const container = document.createElement('div')
      container.className = 'container'
      icon?.joinIn(container)
      if (title === null) {
        const title = getContent(
          {
            parent: pastCourse,
            selectors: '.courselist-title',
          },
          'title'
        )
        title?.joinIn(container)
      } else {
        container.appendChild(title)
      }
      if (status === null) {
        const status = document.createElement('div')
        status.className = 'status dummy'
        container.appendChild(status)
      } else {
        container.appendChild(status)
      }
      container.appendChild(actions)
      titleCell.appendChild(container)

      year?.joinIn(course)
      remarks?.joinIn(course)
      teachers?.joinIn(course)

      pastCourse.replaceWith(course)
    })
  // #endregion

  // #region card type
  document.querySelectorAll('.coursecard').forEach(function (pastCourse) {
    const { title, actions, status } = getComponents(pastCourse)
    const { year, remarks } = getYearAndRemarks(pastCourse)

    const icon = getContent(
      {
        parent: pastCourse,
        selectors: '.course-card-img img',
      },
      'icon',
      'img',
      'src'
    )

    const code = getContent(
      {
        parent: pastCourse,
        selectors: '.coursecode',
      },
      'code'
    )

    const linkState = getContent(
      {
        parent: pastCourse,
        selectors: '.courselink-state',
      },
      'link-state'
    )
    linkState?.joinIn(status)

    const teachers = getContent(
      {
        parent: pastCourse,
        selectors: '.courseitemdetail:last-of-type',
      },
      'teachers'
    )

    const course = document.createElement('div')
    course.className = 'course card'
    icon?.joinIn(course)

    const middle = document.createElement('div')
    middle.className = 'middle'
    code?.joinIn(middle)
    title?.joinIn(middle)
    status?.joinIn(middle)

    const info = document.createElement('div')
    info.className = 'info'
    year?.joinIn(info)
    remarks?.joinIn(info)
    teachers?.joinIn(info)

    middle.appendChild(info)
    course.appendChild(middle)

    course.appendChild(actions)

    pastCourse.replaceWith(course)
  })
  // #endregion
}

const replaceBanners = function () {
  const bannerList = document.querySelector('.banner-list')
  if (bannerList === null) {
    return
  }

  const anchors = bannerList.querySelectorAll('a')
  bannerList.replaceChildren(...anchors)
}

// Entry point
export default function () {
  replaceContentBody()
  replaceCourses()
  replaceBanners()
}
