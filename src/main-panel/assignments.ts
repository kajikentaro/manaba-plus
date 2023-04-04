import getOptions from '../options/model'
import scrape from './scrape'

/**
 * List assignments.
 * @returns Assignment objects
 */
export const list = async function* () {
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

    yield assignment
  }

  for (const hash of removedAssignmentSet) {
    if (!assignmentSet.has(hash)) {
      removedAssignmentSet.delete(hash)
    }
  }

  options['main-panel']['removed-assignments'].value =
    Array.from(removedAssignmentSet)
}
