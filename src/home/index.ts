import getOptions from '../options/models'

import arrange from './arrange'
import hide from './hide'
import move from './move'
import replace from './replace'
import * as insert from './insert'

import getAssignments from './scrape'
import addEventListeners from './event'

import Assignment from './assignment'
import dummies from './dummies.json'

// Entry point.
getOptions().then(async function (options) {
  if (!options.common['allow-changing'].value) {
    return
  }

  arrange()
  await hide()
  await move()
  replace()
  await insert.insertHomePanel()
  await insert.insertMessages()

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

    insert.appendAssignment(assignment)
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

    insert.appendAssignment(assignment)
  }
  // #endregion

  document
    .querySelector('#assignment-list-deadline-header')
    ?.dispatchEvent(new Event('click'))

  await addEventListeners()
})
