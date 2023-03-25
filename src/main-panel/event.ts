import getOptions from '../options/model'
import getHash from './get-hash'
import * as insert from './insert'
import revert from './revert'
import remove from './remove'

/**
 * Add event listeners to buttons on the main panel.
 */
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

/**
 * Make elements removable.
 * @param removedCollectionItem An option collection item of ids
 * @param inputSelectors Query selectors to get the container of removable elements
 * @param revertSelectors Query selectors to get removable elements when revert them
 * @param removeSelectors Query selectors to get removable elements when remove them
 */
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

/**
 * Add event listeners to remove buttons.
 * @param removedCollectionItem An option collection item of ids
 * @param selectors Query Selectors to get remove buttons
 */
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

// Entry point
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
