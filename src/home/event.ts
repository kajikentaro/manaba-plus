import Assignment from './assignment'

import getOptions from '../options/models'
import '../extension/htmlElement'
import { getHash } from './course'

interface Row extends HTMLElement {
  assignment: Assignment
}

const AddTopButtonsActions = function () {
  const contentsButton = document.querySelector('#contents-button')
  contentsButton.removeAttribute('disabled')
  if (contentsButton !== null) {
    contentsButton.addEventListener('click', function () {
      window.open(chrome.runtime.getURL('/contents/index.html'))
    })
  }

  const optionsButton = document.querySelector('#options-button')
  if (optionsButton !== null) {
    optionsButton.removeAttribute('disabled')
    optionsButton.addEventListener('click', function () {
      window.open(chrome.runtime.getURL('/options/index.html'))
    })
  }
}

const setRemainingTime = function (deadline: Date, node: Node) {
  const delta = deadline.getTime() - Date.now()
  const dayCount = delta / (24 * 60 * 60 * 1000)

  if (dayCount < 2) {
    const hours = delta / (60 * 60 * 1000)
    const minutes = (delta / (60 * 1000)) % 60
    const seconds = (delta / 1000) % 60

    node.textContent = [hours, minutes, seconds]
      .filter((value) => value > 1)
      .map(function (value, index) {
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

const addStarsAction = function () {
  document.querySelectorAll('.star').forEach(function (star) {
    star.addEventListener('click', async function (event) {
      event.stopPropagation()

      star.setAttribute('in-progress', '')

      const urlPart1 = star.getAttribute('url-part-1')
      const urlPart3 = star.getAttribute('url-part-3')

      const isStared = star.hasAttribute('stared')
      const urlPart2 = isStared ? 'unset' : 'set'

      const url = urlPart1 + urlPart2 + urlPart3
      const response = await fetch(url)

      if (response.ok) {
        star.toggleAttribute('stared')
      }

      star.removeAttribute('in-progress')
    })
  })
}

const addRemovesAction = async function () {
  const { options } = await getOptions()

  const removedCourseSet = new Set<string>(
    options.home['removed-courses'].value
  )

  document.querySelectorAll('.remove').forEach(function (remove) {
    remove.addEventListener('click', async function (event) {
      event.stopPropagation()

      const course = remove.closest('.course')

      const hash = await getHash(course)
      if (hash === null) {
        return
      }

      if (removedCourseSet.has(hash)) {
        removedCourseSet.delete(hash)
        course.classList.remove('removing')
      } else {
        removedCourseSet.add(hash)
        course.classList.add('removing')
      }

      options.home['removed-courses'].value = Array.from(removedCourseSet)
    })
  })
}

export default async function () {
  const { options } = await getOptions()

  AddTopButtonsActions()

  addStarsAction()
  addRemovesAction()

  // #region
  const assignmentListContainer = document.querySelector<HTMLDetailsElement>(
    '#assignment-list-container'
  )
  if (assignmentListContainer !== null) {
    assignmentListContainer.open =
      options.home['show-assignment-list-open'].value
    assignmentListContainer.addEventListener('toggle', function () {
      options.home['show-assignment-list-open'].value =
        assignmentListContainer.open
    })
  }
  // #endregion

  // #region
  const rows = document.querySelectorAll<Row>('#assignment-list-holder > tr')

  let isAssignmentsVisibilityInputChecked = false
  document
    .querySelector('#assignments-visibility-input')
    ?.addEventListener('input', function (event) {
      const element = event.target as HTMLInputElement
      isAssignmentsVisibilityInputChecked = element.checked

      if (isAssignmentsVisibilityInputChecked) {
        for (const row of rows) {
          row.shown(true)
        }
      } else {
        for (const row of rows) {
          row.shown(row.assignment.isShown)
        }
      }
    })

  for (const row of rows) {
    row.querySelector('input')?.addEventListener('input', function (event) {
      const element = event.target as HTMLInputElement
      row.assignment.isShown = element.checked

      if (!isAssignmentsVisibilityInputChecked) {
        row.shown(element.checked)
      }
    })

    // Update remaining time per 1000 ms.
    const remainingTimeSpan = row.querySelector('.remaining-time')
    if (remainingTimeSpan !== null) {
      const deadline = row.assignment.deadline
      if (deadline !== null) {
        setRemainingTime(deadline, remainingTimeSpan)
        setInterval(setRemainingTime, 1000, deadline, remainingTimeSpan)
      }
    }
  }
  // #endregion
}
