import getOptions from '../../../options/model'
import Assignment from '../../../main-panel/assignment'
import * as assignments from '../../../main-panel/assignments'
import init from './init'
import message from './message'
import { getCalendarId, insertCalendar } from './calendar'

let calendarId: string = null

/**
 * Insert an event associated with an assignment into a calendar.
 * @param assignment The source assignment of the event
 * @returns The inserted event
 */
const insertEvent = async function (assignment: Assignment) {
    if (calendarId === null) {
        return
    }

    const summary = `${assignment.title} | ${assignment.course}`
    const description = assignment.url

    const endDateTime = assignment.deadline

    const startDateTime = new Date(
        endDateTime.getFullYear(),
        endDateTime.getMonth(),
        endDateTime.getDate(),
        endDateTime.getHours() - 1,
    )

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const response = await gapi.client.calendar.events.insert({
        'calendarId': calendarId,
        'resource': {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': startDateTime.toISOString(),
                'timeZone': timezone,
            },
            'end': {
                'dateTime': endDateTime.toISOString(),
                'timeZone': timezone,
            },
        }
    })

    return response.result
}

/**
 * Register assignments not registered to the calendar.
 */
const registerAssignments = async function () {
    if (calendarId === null) {
        await init()

        message('initializing')

        // If the calendar does not exist, create it, and return the calendar id.
        calendarId = await getCalendarId()
        if (calendarId === null) {
            calendarId = await insertCalendar()
            if (calendarId === null) {
                message('initialization-failed')
            }
            else {
                message('created')
            }

            return
        }

        message('initialized')
    }

    message('registering')

    const { options } = await getOptions()

    const assignmentSet = new Set<string>()
    const registeredAssignmentSet = new Set<string>(
        options.reminders['google-calendar']['registered-assignments-gc'].value
    )

    for await (const assignment of assignments.list()) {
        const hash = await assignment.hash

        assignmentSet.add(hash)

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
    document.querySelector('#register button')?.addEventListener('click', registerAssignments)
}