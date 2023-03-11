import getOptions from '../options/models'
import * as event from '../main-panel/event'

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
