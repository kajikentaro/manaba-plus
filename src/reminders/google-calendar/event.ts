import getOptions from '../../options/model'
import Assignment from '../../main-panel/assignment'

const recordAssignments = async function (event: Event) {
  const callback = event.target
  if (!('assignments' in callback)) {
    return
  }

  const { options } = await getOptions()

  const registeredAssignmentSet = new Set<string>(
    options.reminders['google-calendar']['registered-assignments-gc'].value
  )

  const registeredAssignments = callback.assignments as Assignment[]

  for (const assignment of registeredAssignments) {
    const hash = await assignment.hash

    registeredAssignmentSet.add(hash)
  }

  options.reminders['google-calendar']['registered-assignments-gc'].value =
    Array.from(registeredAssignmentSet)
}

// Entry point
export default function () {
  document
    .querySelector('#register .callback')
    ?.addEventListener('click', recordAssignments)
}
