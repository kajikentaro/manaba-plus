import { fetchText } from '../fetch'
import Assignment from './assignment'
import '../extension/htmlElement'

let holder: HTMLElement = null

export const insertHomePanel = async function () {
  const contentbodyLeft = document.querySelector('.contentbody-left')
  if (contentbodyLeft === null) {
    return
  }

  const homePanelUrl = chrome.runtime.getURL('/home/index.html')
  const homePanelText = await fetchText(homePanelUrl)

  contentbodyLeft.insertAdjacentHTML('afterbegin', homePanelText)

  // Make assignment-list sortable
  require('sortable-decoration')

  holder = document.querySelector<HTMLElement>('#assignment-list-holder')
}

const now = Date.now()

// DEFCON is the condition that indicates the urgency of an assignment.
const getDEFCON = function (dateTime: Date) {
  if (dateTime === null) {
    return 'DEFCON-1'
  }

  const delta = dateTime.getTime() - now
  if (delta < 0) {
    return 'DEFCON-0'
  }

  const dayCount = delta / (24 * 60 * 60 * 1000)
  switch (true) {
    case dayCount < 3:
      return 'DEFCON-3'
    case dayCount < 7:
      return 'DEFCON-2'
    default:
      return 'DEFCON-1'
  }
}

const courseUrlRegex = /.+course_\d+/

const getCourseUrl = function (assignmentUrl: string) {
  return courseUrlRegex.exec(assignmentUrl)[0]
}

export const appendAssignment = function (assignment: Assignment) {
  if (holder === null) {
    return
  }

  const row = document.createElement('tr')
  row.className = getDEFCON(assignment.deadline)
  Object.defineProperty(row, 'assignment', { value: assignment })
  row.shown(assignment.isShown)

  const courseAnchor = document.createElement('a')
  courseAnchor.href = getCourseUrl(assignment.url)
  courseAnchor.innerHTML = assignment.course
  row.insertCell().appendChild(courseAnchor)

  const titleAnchor = document.createElement('a')
  titleAnchor.href = assignment.url
  titleAnchor.innerHTML = assignment.title
  row.insertCell().appendChild(titleAnchor)

  const visibilityInput = document.createElement('input')
  visibilityInput.type = 'checkbox'
  visibilityInput.checked = assignment.isShown
  row.insertCell().appendChild(visibilityInput)

  const deadlineText = document.createTextNode(
    assignment.deadline?.toLocaleString('ja-JP', {
      month: 'short',
      day: '2-digit',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    })
  )
  row.insertCell().appendChild(deadlineText)

  const remainingTimeSpan = document.createElement('span')
  remainingTimeSpan.className = 'remaining-time'
  row.insertCell().appendChild(remainingTimeSpan)

  holder.appendChild(row)
}
