import * as api from '../../../utils/gapi'
import Assignment from '../../../main-panel/assignment'
import message from './message'
import { getCalendarId, insertCalendar } from './calendar'
import {encode, decode} from '../../../reminders/google-calendar/assignments'

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

  try {
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
  } catch (error) {
    console.error(error)
  }
  
  return null
}

/**
 * Register assignments not registered to the calendar.
 */
const registerAssignments = async function (event: Event) {
  if (await initialize()) {
    return
  }

  const button = event.target as HTMLElement
  const inputAttribute = button.getAttribute('assignments')
  if (inputAttribute === null) {
    return
  }

  message('registering')

  const assignments = decode(inputAttribute)

  const promises = assignments.map(async function (assignment) {
    const event = await insertEvent(assignment)
    return { assignment, event }
  })

  const results = await Promise.all(promises)

  const registeredAssignments: Assignment[] = []

  for (const { assignment, event } of results) {
    if (event === null) {
      continue
    }

    registeredAssignments.push(assignment)
  }

  const outputAttribute = encode(registeredAssignments)

  const callback = document.querySelector('#register .callback')
  callback.setAttribute('assignments', outputAttribute)

  callback.dispatchEvent(new Event('click'))

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
