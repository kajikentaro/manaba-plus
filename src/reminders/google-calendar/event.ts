import * as api from '../../utils/gapi'
import getOptions from '../../options/model'
import Assignment from '../../main-panel/assignment'
import message from './message'
import { getCalendarId, insertCalendar } from './calendar'
import * as storage from '../../utils/storage'
import constants from '../../constants'

let calendarId: string = null

/**
 * Initialize Google APi and set calendar id.
 * @returns True if a request fails or a calendar is created, otherwise false
 */
const initialize = async function () {
  if (calendarId === null) {
    await api.init

    const tokenResponse = await api.signIn()
    if ('error' in tokenResponse) {
      const message = [
        tokenResponse.error,
        tokenResponse.error_description,
        tokenResponse.error_uri,
      ].join('\n')

      alert(message)

      return true
    }

    message('initializing')

    // If the calendar does not exist, create it, and return the calendar id.
    calendarId = await getCalendarId()
    if (calendarId === null) {
      calendarId = await insertCalendar()
      if (calendarId === null) {
        message('initialization-failed')
      } else {
        message('created')
      }

      return true
    }

    message('initialized')
  }

  return false
}

/**
 * Insert an event associated with an assignment into a calendar.
 * @param assignment The source assignment of the event
 * @returns The event if it is inserted, otherwise null
 */
const insertEvent = async function (assignment: Assignment) {
  if (calendarId === null) {
    return null
  }

  if (assignment.deadline === null) {
    return null
  }

  const summary = `${assignment.title} | ${assignment.course}`
  const description = assignment.url

  const endDateTime = assignment.deadline

  const startDateTime = new Date(
    endDateTime.getFullYear(),
    endDateTime.getMonth(),
    endDateTime.getDate(),
    endDateTime.getHours() - 1
  )

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const response = await gapi.client.calendar.events.insert({
    calendarId: calendarId,
    resource: {
      summary: summary,
      description: description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: timezone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: timezone,
      },
    },
  })

  return response.result
}

/**
 * Register assignments not registered to the calendar.
 */
const registerAssignments = async function () {
  if (await initialize()) {
    return
  }

  message('registering')

  const { options } = await getOptions()

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

    insertEvent(assignment)
  }

  for (const hash of registeredAssignmentSet) {
    if (!assignmentSet.has(hash)) {
      registeredAssignmentSet.delete(hash)
    }
  }

  options.reminders['google-calendar']['registered-assignments-gc'].value =
    Array.from(registeredAssignmentSet)

  message('registered')
}

/**
 * Add event listeners to buttons.
 * @param id The id of the calendar that events are inserted to
 */
export default function () {
  document
    .querySelector('#register button')
    ?.addEventListener('click', registerAssignments)
}
