import getOptions from '../options/models'

import arrange from './arrange'
import hide from './hide'
import move from './move'
import { insertHomePanel, appendAssignment } from './insert'

import getAssignments from './scrape'
import addEventListeners from './event'

import Assignment from './assignment'
import dummies from './dummies.json'

// Entry point.
getOptions().then(async function (options) {
  if (!options.home['allow-changing'].value) {
    return
  }

  arrange()
  await hide()
  await move()
  await insertHomePanel()

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

  document
    .querySelector('#assignment-list-deadline-header')
    ?.dispatchEvent(new Event('click'))

  await addEventListeners()

  const progressBar = document.querySelector('#assignment-list-progress-bar')
  if (progressBar !== null) {
    progressBar.classList.remove('in-progress')
  }
})
