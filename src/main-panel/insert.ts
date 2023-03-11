import { popMessages } from 'messages'
import Assignment from './assignment'
import '../extension/htmlElement'
import getOptions from '../options/model'
import scrape from './scrape'

import dummies from './dummies.json'

const insertMessages = async function () {
  const messageHolder = document.querySelector('#messages-holder')

  const messages = await popMessages()
  for (const message of messages) {
    const messageDiv = document.createElement('div')
    messageDiv.innerText = message
    messageHolder.appendChild(messageDiv)
  }
}

export const insertRemove = function (actions: Element) {
  if (actions === null) {
    return
  }

  const remove = document.createElement('div')
  remove.className = 'remove'
  actions.appendChild(remove)
}

// #region Assignment list
// DEFCON is the condition that indicates the urgency of an assignment.
const getDEFCON = function (dateTime: Date) {
  if (dateTime === null) {
    return 'defcon-1'
  }

  const delta = dateTime.getTime() - Date.now()
  if (delta < 0) {
    return 'defcon-0'
  }

  const dayCount = delta / (24 * 60 * 60 * 1000)
  switch (true) {
    case dayCount < 1:
      return 'defcon-4'
    case dayCount < 3:
      return 'defcon-3'
    case dayCount < 7:
      return 'defcon-2'
    default:
      return 'defcon-1'
  }
}

let assignmentListHolder: Element

const appendAssignment = function (assignment: Assignment) {
  const row = document.createElement('tr')
  row.className = 'assignment'
  row.classList.add(getDEFCON(assignment.deadline))
  Object.defineProperty(row, 'assignment', { value: assignment })
  row.shown(assignment.isShown)

  const courseUrl = /.+course_\d+/.exec(assignment.url)[0]

  const courseAnchor = document.createElement('a')
  courseAnchor.href = courseUrl
  courseAnchor.innerHTML = assignment.course
  row.insertCell().appendChild(courseAnchor)

  const title = document.createElement('div')
  title.className = 'title'

  const titleAnchor = document.createElement('a')
  titleAnchor.href = assignment.url
  titleAnchor.innerHTML = assignment.title
  title.appendChild(titleAnchor)

  const actions = document.createElement('div')
  actions.className = 'actions'
  title.appendChild(actions)
  insertRemove(actions)

  row.insertCell().appendChild(title)

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

let isAssignmentListInserted = false

export const insertAssignmentList = async function () {
  if (isAssignmentListInserted) {
    return
  }

  isAssignmentListInserted = true

  assignmentListHolder = document.querySelector<HTMLElement>(
    '#assignment-list-holder'
  )

  const { options } = await getOptions()

  const assignmentSet = new Set<string>()
  const removedAssignmentSet = new Set<string>(
    options['main-panel']['removed-assignments'].value
  )

  for await (const assignment of scrape()) {
    const hash = await assignment.hash

    assignmentSet.add(hash)

    assignment.isShown = !removedAssignmentSet.has(hash)
    assignment.onIsShownChanged.push(function (value) {
      if (value) {
        removedAssignmentSet.delete(hash)
      } else {
        removedAssignmentSet.add(hash)
      }
      options['main-panel']['removed-assignments'].value =
        Array.from(removedAssignmentSet)
    })

    appendAssignment(assignment)
  }

  for (const hash of removedAssignmentSet) {
    if (!assignmentSet.has(hash)) {
      removedAssignmentSet.delete(hash)
    }
  }

  options['main-panel']['removed-assignments'].value =
    Array.from(removedAssignmentSet)

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

export const insertMainComponents = async function () {
  // Make assignment-list sortable.
  require('sortable-decoration')

  const { options } = await getOptions()

  await insertMessages()

  const assignmentListContainer = document.querySelector<HTMLDetailsElement>(
    '#assignment-list-container'
  )
  if (assignmentListContainer !== null) {
    assignmentListContainer.open =
      options['main-panel']['show-assignment-list-open'].value
    if (assignmentListContainer.open) {
      await insertAssignmentList()
    }
  }
}
