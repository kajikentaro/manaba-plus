import constants from '../../../constants'

/**
 * Get the id of the calendar in the user's calendar list.
 * @returns The calendar id if the calendar exists, otherwise null
 */
export const getCalendarId = async function () {
    const response = await gapi.client.calendar.calendarList.list()
    const calendars = response.result.items

    if (typeof calendars !== 'undefined') {
        for (const calendar of calendars) {
            if (calendar.summary === constants['calendar-name']) {
                if (typeof calendar.id === 'undefined') {
                    return null
                }

                return calendar.id
            }
        }
    }

    return null
}

/**
 * Insert a calendar to the user's calendar list.
 * @returns The calenda id
 */
export const insertCalendar = async function () {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const response = await gapi.client.calendar.calendars.insert({}, {
        'summary': constants['calendar-name'],
        'timeZone': timezone,
    })

    const calendarId = response.result.id
    if (typeof calendarId === 'undefined') {
        return null
    }

    return calendarId
}
