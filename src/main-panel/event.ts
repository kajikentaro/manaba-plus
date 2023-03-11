import Assignment from './assignment'
import getOptions from '../options/models'
import getHash from './get-hash'
import * as insert from './insert'
import revert from './revert'
import remove from './remove'

interface Row extends HTMLElement {
  assignment: Assignment
}

const AddButtonsAction = function () {
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

const setRemainingTime = function (deadline: Date, element: Element) {
  const delta = deadline.getTime() - Date.now()
  const dayCount = delta / (24 * 60 * 60 * 1000)

  if (dayCount < 2) {
    const hours = delta / (60 * 60 * 1000)
    const minutes = (delta / (60 * 1000)) % 60
    const seconds = (delta / 1000) % 60

    element.classList.add('time')
    element.textContent = [hours, minutes, seconds]
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
    element.classList.add('day-count')
    element.textContent = Math.floor(dayCount).toString()
  }
}

export const addVisibilityAction = function (context: {
  removedCollectionItem: OptionCollectionItem
  inputSelectors: string
  revertSelectors: string
  removeSelectors: string
}) {
  remove(context.removedCollectionItem, context.removeSelectors)

  document
    .querySelector(context.inputSelectors)
    ?.addEventListener('input', async function (event) {
      const element = event.target as HTMLInputElement
      if (element.checked) {
        revert(context.revertSelectors)
      } else {
        remove(context.removedCollectionItem, context.removeSelectors)
      }
    })
}

export const addRemovesAction = function (
  removedCollectionItem: OptionCollectionItem,
  selectors: string
) {
  const removedSet = new Set<string>(removedCollectionItem.value)

  document.querySelectorAll(selectors).forEach(function (element) {
    element
      .querySelector('.remove')
      ?.addEventListener('click', async function (event) {
        event.stopPropagation()

        const hash = await getHash(element)
        if (hash === null) {
          return
        }

        if (removedSet.has(hash)) {
          removedSet.delete(hash)
          element.removeAttribute('removed')
        } else {
          removedSet.add(hash)
          element.setAttribute('removed', '')
        }

        removedCollectionItem.value = Array.from(removedSet)
      })
  })
}

export const addMainActions = async function () {
  const { options } = await getOptions()

  AddButtonsAction()

  // #region
  const assignmentListContainer = document.querySelector<HTMLDetailsElement>(
    '#assignment-list-container'
  )
  if (assignmentListContainer !== null) {
    assignmentListContainer.addEventListener('toggle', async function () {
      options['main-panel']['show-assignment-list-open'].value =
        assignmentListContainer.open

      if (assignmentListContainer.open) {
        await insert.insertAssignmentList()
      }
    })
  }
  // #endregion

  document
    .querySelectorAll<Row>('#assignment-list-holder > tr')
    .forEach(function (row) {
      // Update remaining time per 1000 ms.
      const remainingTimeSpan = row.querySelector('.remaining-time')
      if (remainingTimeSpan !== null) {
        const deadline = row.assignment.deadline
        if (deadline !== null) {
          setRemainingTime(deadline, remainingTimeSpan)
          setInterval(setRemainingTime, 1000, deadline, remainingTimeSpan)
        }
      }
    })

  const removedCollectionItem = options['main-panel'][
    'removed-assignments'
  ] as OptionCollectionItem

  addVisibilityAction({
    removedCollectionItem,
    inputSelectors: '#assignments-visibility-input',
    revertSelectors: '.assignment[removed]',
    removeSelectors: '.assignment',
  })
  addRemovesAction(removedCollectionItem, '.assignment')
}
