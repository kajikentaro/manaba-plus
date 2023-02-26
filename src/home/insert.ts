import { fetchText } from '../fetch'
import Assignment from './assignment'
import '../extension/htmlElement'

let holder: HTMLElement = null

export const insertHomePanel = async () => {
  const contentbodyLeft = document.querySelector('.contentbody-left')
  if (contentbodyLeft !== null) {
    const homePanelURL = chrome.runtime.getURL('home/index.html')
    const homePanelText = await fetchText(homePanelURL)

    contentbodyLeft.insertAdjacentHTML('afterbegin', homePanelText)
  }

  holder = document.querySelector<HTMLElement>('#assignment-list-holder')

  console.log('Inserted!')
}

const now = Date.now()

// DEFCON is the condition that indicates the urgency of an assignment.
const getDEFCON = (dateTime: Date) => {
  if (dateTime === undefined) {
    return 'DEFCON-1'
  }

  const delta = dateTime.getTime() - now
  if (delta < 0) {
    console.log('The delta time became minus: ' + delta)
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

const courseURLRegex = /.+course_\d+/

const getCourseURL = (assignmentURL: string) =>
  courseURLRegex.exec(assignmentURL)[0]

export const appendAssignment = (assignment: Assignment) => {
  if (holder === null) {
    return
  }

  const row = document.createElement('tr')
  row.className = getDEFCON(assignment.deadline)
  Object.defineProperty(row, 'assignment', { value: assignment })
  if ('isShown' in row) {
    row.isShown = assignment.isShown
  }
  Object.defineProperty(row, '_isShown', { value: undefined, writable: true })

  const courceAnchor = document.createElement('a')
  courceAnchor.href = getCourseURL(assignment.url)
  courceAnchor.innerHTML = assignment.course
  row.insertCell().appendChild(courceAnchor)

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
