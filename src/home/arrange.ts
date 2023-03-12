import getOptions from '../options/model'

const arrangeIds = async function () {
  const { options } = await getOptions()

  const setId = function (selectors: string, id: string) {
    const element = document.querySelector(selectors)
    if (element === null) {
      return
    }

    element.id = id
  }

  setId(
    '.alertlist',
    options.home['visibility-and-movement']['hide-or-move-alert'].id
  )
  setId(
    '.my-infolist-centernews',
    options.home['visibility-and-movement']['hide-or-move-centernews'].id
  )
  setId(
    '.my-infolist-searchall',
    options.home['visibility-and-movement']['hide-or-move-syllabus'].id
  )
  setId(
    '.my-infolist-event',
    options.home['visibility-and-movement']['hide-or-move-assignment'].id
  )
  setId(
    '.my-infolist-tips:not(.my-infolist-kikuzou)',
    options.home['visibility-and-movement']['hide-or-move-former-link'].id
  )
  setId(
    '.my-infolist-kikuzou',
    options.home['visibility-and-movement']['hide-or-move-kikuzou'].id
  )
  setId(
    '.banner-list',
    options.home['visibility-and-movement']['hide-or-move-banner-list'].id
  )
}

const arrangeClasses = function () {
  const addClass = function (selectors: string, ...names: string[]) {
    document.querySelectorAll(selectors).forEach(function (element) {
      element.classList.add(...names)
    })
  }
  const removeClass = function (selectors: string, ...names: string[]) {
    document.querySelectorAll(selectors).forEach(function (element) {
      element.classList.remove(...names)
    })
  }

  removeClass('.course:not(.course-cell)', 'course')
  addClass('.courselist', 'fixed-table', 'striped-table')
  addClass('.period', 'center-align')
}

const makeResponsible = function () {
  document
    .querySelector<HTMLElement>('.infolist-tab')
    ?.style?.removeProperty('margin-bottom')

  document
    .querySelector<HTMLElement>('#courselistweekly')
    ?.style?.removeProperty('padding-right')

  document
    .querySelectorAll<HTMLElement>('.courselist')
    .forEach(function (element) {
      element.style.removeProperty('width')
    })
  document.querySelectorAll('.courselist th').forEach(function (element) {
    element.removeAttribute('width')
  })
}

export default async function () {
  await arrangeIds()
  arrangeClasses()
  makeResponsible()
}
