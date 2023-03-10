import getOptions from '../options/models'
import { fetchText } from '../fetch'
import { popMessages } from 'messages'
import Assignment from './assignment'
import '../extension/htmlElement'
import getAssignments from './scrape'

import dummies from './dummies.json'

let assignmentListHolder: HTMLElement

export const insertHomePanel = async function () {
  const contentbodyLeft = document.querySelector('#content-body .left')
  if (contentbodyLeft === null) {
    return
  }

  const homePanelUrl = chrome.runtime.getURL('/home/index.html')
  const homePanelText = await fetchText(homePanelUrl)

  contentbodyLeft.insertAdjacentHTML('afterbegin', homePanelText)

  // Make assignment-list sortable
  require('sortable-decoration')

  assignmentListHolder = document.querySelector<HTMLElement>(
    '#assignment-list-holder'
  )
}

export const insertMessages = async function () {
  const messageHolder = document.querySelector('#messages-holder')

  const messages = await popMessages()
  for (const message of messages) {
    const messageDiv = document.createElement('div')
    messageDiv.innerText = message
    messageHolder.appendChild(messageDiv)
  }
}

// #region Assignment list
// DEFCON is the condition that indicates the urgency of an assignment.
const getDEFCON = function (dateTime: Date) {
  if (dateTime === null) {
    return 'DEFCON-1'
  }

  const delta = dateTime.getTime() - Date.now()
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

const getCourseUrl = function (assignmentUrl: string) {
  return /.+course_\d+/.exec(assignmentUrl)[0]
}

export const appendAssignment = function (assignment: Assignment) {
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

  assignmentListHolder.appendChild(row)
}

const insertAssignmentList = async function () {
  const { options } = await getOptions()

  const assignmentSet = new Set<string>()
  const hiddenAssignmentSet = new Set<string>(
    options.home['hidden-assignments'].value
  )

  for await (const assignment of getAssignments()) {
    const hash = await assignment.hash

    assignmentSet.add(hash)

    assignment.isShown = !hiddenAssignmentSet.has(hash)
    assignment.onIsShownChanged.push(function (value) {
      if (value) {
        hiddenAssignmentSet.delete(hash)
      } else {
        hiddenAssignmentSet.add(hash)
      }
      options.home['hidden-assignments'].value = Array.from(hiddenAssignmentSet)
    })

    appendAssignment(assignment)
  }

  for (const hash of hiddenAssignmentSet) {
    if (!assignmentSet.has(hash)) {
      hiddenAssignmentSet.delete(hash)
    }
  }

  options.home['hidden-assignments'].value = Array.from(hiddenAssignmentSet)

  // #region Dummy
  for (const dummy of dummies) {
    const assignment = new Assignment(
      dummy.url,
      dummy.title,
      dummy.course,
      new Date(dummy.deadline)
    )

    appendAssignment(assignment)
  }
  // #endregion
}
// #endregion

export const insertRemoves = function () {
  document.querySelectorAll('.course').forEach(function (course) {
    const actions = course.querySelector('.actions')
    if (actions === null) {
      return
    }

    const remove = document.createElement('div')
    remove.className = 'remove'
    actions.appendChild(remove)
  })
}

export default async function () {
  insertRemoves()
  await insertHomePanel()
  await insertMessages()
  await insertAssignmentList()
}
