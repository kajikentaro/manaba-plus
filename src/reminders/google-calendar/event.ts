import getOptions from '../../options/model'
import { decode } from './assignments'

const recordAssignments = async function (event: Event) {
  const callback = event.target as HTMLElement
  const attribute = callback.getAttribute('assignments')
  if (attribute === null) {
    return
  }

  const { options } = await getOptions()

  const registeredAssignmentSet = new Set<string>(
    options.reminders['google-calendar']['registered-assignments-gc'].value
  )

  const registeredAssignments = decode(attribute)

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
