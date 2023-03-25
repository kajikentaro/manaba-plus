import getOptions from '../options/model'
import * as event from '../main-panel/event'

/**
 * Add event listeners to stars.
 */
const addStarsAction = function () {
  document.querySelectorAll('.star').forEach(function (star) {
    star.addEventListener('click', async function (event) {
      event.stopPropagation()

      star.setAttribute('in-progress', '')

      const urlPart1 = star.getAttribute('url-part-1')
      const urlPart3 = star.getAttribute('url-part-3')

      const isOn = star.hasAttribute('on')
      const urlPart2 = isOn ? 'unset' : 'set'

      const url = urlPart1 + urlPart2 + urlPart3
      const response = await fetch(url)

      // If changing the state of the star succeeded...
      if (response.ok) {
        star.toggleAttribute('on')
      }

      star.removeAttribute('in-progress')
    })
  })
}

// Entry point
export default async function () {
  const { options } = await getOptions()

  const removedCollectionItem = options.home[
    'removed-courses'
  ] as OptionCollectionItem

  event.addVisibilityAction({
    removedCollectionItem,
    inputSelectors: '#courses-visibility-input',
    revertSelectors: '.course[removed]',
    removeSelectors: '.course',
  })
  event.addRemovesAction(removedCollectionItem, '.course')

  addStarsAction()
}
