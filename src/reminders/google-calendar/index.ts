import getOptions from '../../options/model'
import Assignment from '../../main-panel/assignment'
import * as storage from '../../utils/storage'
import constants from '../../constants'

/**
 * Get stored assignments from local storage.
 * @returns The assignments excluded removed ones
 */
const getAssignments = async function () {
  const { options } = await getOptions()

  const assignments: Assignment[] = []

  const assignmentSet = new Set<string>()
  const removedAssignmentSet = new Set<string>(
    options['main-panel']['removed-assignments'].value
  )
  const registeredAssignmentSet = new Set<string>(
    options.reminders['google-calendar']['registered-assignments-gc'].value
  )

  const assignmentsData = await storage.get<string[]>(
    constants['storage-keys']['assignments-data'],
    []
  )

  for (const assignmentData of assignmentsData) {
    const assignment = Assignment.from(assignmentData)

    const hash = await assignment.hash

    assignmentSet.add(hash)

    if (removedAssignmentSet.has(hash)) {
      continue
    }

    if (registeredAssignmentSet.has(hash)) {
      continue
    }

    assignments.push(assignment)
  }

  for (const hash of registeredAssignmentSet) {
    if (!assignmentSet.has(hash)) {
      registeredAssignmentSet.delete(hash)
    }
  }

  options.reminders['google-calendar']['registered-assignments-gc'].value =
    Array.from(registeredAssignmentSet)

  return assignments
}

// Entry point.
getOptions().then(async function () {
  const assignments = await getAssignments()

  const button = document.querySelector('#register button')
  Object.defineProperty(button, 'assignments', {
    value: assignments,
  })
})
