import Assignment from './assignment'

import getOptions from '../options/models'
import '../extension/htmlElement'

interface Row extends HTMLElement {
  assignment: Assignment
}

const setRemainingTime = (deadline: Date, node: Node) => {
  const delta = deadline.getTime() - Date.now()
  const dayCount = delta / (24 * 60 * 60 * 1000)

  if (dayCount < 2) {
    const hours = delta / (60 * 60 * 1000)
    const minutes = (delta / (60 * 1000)) % 60
    const seconds = (delta / 1000) % 60

    node.textContent = [hours, minutes, seconds]
      .filter((value) => value > 1)
      .map((value, index) => {
        const chars = Math.floor(value).toString()
        if (index === 0) {
          return chars
        } else {
          return chars.padStart(2, '0')
        }
      })
      .join(':')
  } else {
    node.textContent = Math.floor(dayCount).toString()
  }
}

export default async () => {
  const options = await getOptions()

  const assignmentListContainer = document.querySelector<HTMLDetailsElement>(
    '#assignment-list-container'
  )
  if (assignmentListContainer !== null) {
    assignmentListContainer.open =
      options.home['show-assignment-list-open'].value
    assignmentListContainer.addEventListener('toggle', () => {
      options.home['show-assignment-list-open'].value =
        assignmentListContainer.open
    })
  }

  const rows = document.querySelectorAll<Row>('#assignment-list-holder > tr')

  let isAssignmentsVisibilityInputChecked = false
  document
    .querySelector('#assignments-visibility-input')
    ?.addEventListener('input', (event) => {
      const element = event.target as HTMLInputElement
      isAssignmentsVisibilityInputChecked = element.checked

      if (isAssignmentsVisibilityInputChecked) {
        for (const row of rows) {
          row.isShown = true
        }
      } else {
        for (const row of rows) {
          row.isShown = row.assignment.isShown
        }
      }
    })

  for (const row of rows) {
    row.querySelector('input')?.addEventListener('input', (event) => {
      const element = event.target as HTMLInputElement
      row.assignment.isShown = element.checked

      if (!isAssignmentsVisibilityInputChecked) {
        row.isShown = element.checked
      }
    })

    // Update remaining time per 1000 ms.
    const remainingTimeSpan = row.querySelector('.remaining-time')
    if (remainingTimeSpan !== null) {
      const deadline = row.assignment.deadline
      if (deadline !== undefined) {
        setRemainingTime(deadline, remainingTimeSpan)
        setInterval(setRemainingTime, 1000, deadline, remainingTimeSpan)
      }
    }
  }
}
