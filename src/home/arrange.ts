import getOptions from '../options/models'

export default async function () {
  const { options } = await getOptions()

  // #region id
  const setId = function (selectors: string, id: string) {
    document.querySelector(selectors).id = id
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
  // #endregion

  // #region class
  const addClass = function (selectors: string, name: string) {
    document.querySelectorAll(selectors).forEach(function (element) {
      element.classList.add(name)
    })
  }
  const removeClass = function (selectors: string, name: string) {
    document.querySelectorAll(selectors).forEach(function (element) {
      element.classList.remove(name)
    })
  }

  addClass('#banner-list', 'wrap-box')

  removeClass('.course:not(.course-cell)', 'course')
  addClass('.courselist-c, .coursecard', 'course')
  addClass(
    '.course-cell a:first-of-type, .courselist-title a, .course-card-title a',
    'title'
  )
  addClass('.courselist-c td:nth-child(2)', 'year')
  addClass('.courselist-c td:nth-child(3)', 'remarks')
  addClass(
    '.courselist-c td:nth-child(4), .courseitemdetail:last-of-type',
    'teachers'
  )
  // #endregion

  // #region Make responsible.

  document
    .querySelector<HTMLElement>('#courselistweekly')
    ?.style?.removeProperty('padding-right')

  document
    .querySelector<HTMLElement>('.courselist')
    ?.style?.removeProperty('width')
  document.querySelectorAll('.courselist th').forEach(function (element) {
    element.removeAttribute('width')
  })
  // #endregion
}
