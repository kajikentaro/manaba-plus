import { fetchDOM } from 'fetch'

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
  attributeName = 'innerText'
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

  if (attributeName in source && attributeName in target) {
    const attribute = source[attributeName]
    target[attributeName] = attribute
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
  const pastTitle = course.querySelector<HTMLAnchorElement>(
    '.course-cell a:first-of-type, .courselist-title a, .course-card-title a'
  )
  if (pastTitle === null) {
    return { title: null, status: null, registrationState: null }
  }

  const courseUrl = pastTitle.href

  const title = document.createElement('a')
  title.className = 'title'
  title.href = courseUrl
  title.innerText = pastTitle.innerText

  const pastStatus = course.querySelector('.coursestatus, .course-card-status')
  if (pastStatus === null) {
    return { title, status: null, registrationState: null }
  }

  const children = Array.from(pastStatus.children)

  let registrationState: Element = getContent(
    {
      parent: course,
      selectors: 'span[style]',
    },
    'registration-state'
  )
  if (children[0].className === 'registration-state') {
    registrationState = children.shift()
  }

  const status = document.createElement('div')
  status.className = 'status flex-box'

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

  return { title, status, registrationState }
}

const starRegex = /(.+_)(set|unset)(_.+)$/

const getStar = function (course: Element) {
  const starAnchor = course.querySelector<HTMLAnchorElement>(
    'a[href^="home_fav"]'
  )
  if (starAnchor === null) {
    return null
  }

  const star = document.createElement('img')
  star.className = 'star'
  star.src = '../icon_clip_on.png'

  const match = starRegex.exec(starAnchor.href)

  star.setAttribute('url-part-1', match[1])
  star.setAttribute('url-part-3', match[3])

  if (match[2] === 'unset') {
    star.setAttribute('stared', '')
  }

  return star
}

const getComponents = function (course: Element) {
  const { title, status, registrationState } = getTitleAndStatus(course)
  const star = getStar(course)

  const titleDiv = document.createElement('div')
  if (title !== null) {
    titleDiv.appendChild(title)
  }
  if (registrationState !== null) {
    titleDiv.appendChild(registrationState)
  }

  const actions = document.createElement('div')
  actions.className = 'actions'
  if (star !== null) {
    actions.appendChild(star)
  }

  return { titleDiv, actions, status }
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
    const { titleDiv, actions, status } = getComponents(pastCourse)

    const course = document.createElement('td')
    course.className = 'course cell'

    const container = document.createElement('div')
    container.className = 'grid-box'
    container.appendChild(titleDiv)
    container.appendChild(actions)
    if (status !== null) {
      container.appendChild(status)
    }

    course.appendChild(container)

    pastCourse.replaceWith(course)
  })
  // #endregion

  // #region row type
  document
    .querySelectorAll('.courselist-c, .courselist-r')
    .forEach(function (pastCourse) {
      const { titleDiv, actions, status } = getComponents(pastCourse)
      titleDiv.classList.add('omitted-text')
      actions.className = 'flex-box'

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
      titleCell.className = 'grid-box'
      titleCell.appendChild(icon)
      titleCell.appendChild(titleDiv)
      if (status !== null) {
        titleCell.appendChild(status)
      }
      titleCell.appendChild(actions)

      if (titleDiv.childElementCount === 0) {
        const title = getContent(
          {
            parent: pastCourse,
            selectors: '.courselist-title',
          },
          'title'
        )
        titleDiv.appendChild(title)
      }

      course.appendChild(year)
      course.appendChild(remarks)
      course.appendChild(teachers)

      pastCourse.replaceWith(course)
    })
  // #endregion

  // #region card type
  document.querySelectorAll('.coursecard').forEach(function (pastCourse) {
    const { titleDiv, actions, status } = getComponents(pastCourse)
    const { year, remarks } = getYearAndRemarks(pastCourse)
    titleDiv.classList.add('omitted-text')

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

    const teachers = getContent(
      {
        parent: pastCourse,
        selectors: '.courseitemdetail:last-of-type',
      },
      'teachers'
    )

    const course = document.createElement('div')
    course.className = 'course card grid-box'
    course.appendChild(icon)

    const middleDiv = document.createElement('div')
    middleDiv.className = 'middle flex-box'
    middleDiv.appendChild(code)
    middleDiv.appendChild(titleDiv)
    middleDiv.appendChild(status)

    const infoDiv = document.createElement('div')
    infoDiv.className = 'info flex-box grid-box'
    infoDiv.appendChild(year)
    infoDiv.appendChild(remarks)
    infoDiv.appendChild(teachers)

    middleDiv.appendChild(infoDiv)
    course.appendChild(middleDiv)

    course.appendChild(actions)

    pastCourse.replaceWith(course)
  })
  // #endregion

  document.querySelectorAll('.remarks, .teachers').forEach(function (element) {
    element.classList.add('omitted-text')
  })
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
