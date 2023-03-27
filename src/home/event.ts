import getOptions from '../options/model'
import * as event from '../main-panel/event'
import getHash from 'main-panel/get-hash'

/**
 * Add event listeners to stars.
 */
const addStarsAction = async function () {
  const { options } = await getOptions()

  const starredSet = new Set<string>(options.home['starred-courses'].value)

  document.querySelectorAll('.course').forEach(async function (course) {
    const star = course.querySelector('.star')
    if (star === null) {
      return
    }

    const hash = await getHash(course)
    if (starredSet.has(hash)) {
      star.setAttribute('starred', '')
    }

    star.addEventListener('click', async function (event) {
      event.stopPropagation()

      if (starredSet.has(hash)) {
        starredSet.delete(hash)
        star.removeAttribute('starred')
      } else {
        starredSet.add(hash)
        star.setAttribute('starred', '')
      }

      options.home['starred-courses'].value = Array.from(starredSet)
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

  await addStarsAction()
}
