export default function () {
  // #region Class
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
  const contentbodyLeft =
    document.querySelector<HTMLElement>('.contentbody-left')
  if (contentbodyLeft !== null) {
    contentbodyLeft.style.width = '671px'
    contentbodyLeft.style.paddingRight = '15px'
  }

  document
    .querySelector<HTMLElement>('#courselistweekly')
    ?.style?.removeProperty('padding-right')
  document
    .querySelectorAll<HTMLElement>('.my-infolist-header')
    .forEach(function (element) {
      element.style.backgroundSize = '100% 100%'
    })

  document
    .querySelector<HTMLElement>('.courselist')
    .style.removeProperty('width')
  document.querySelectorAll('.courselist th').forEach(function (element) {
    element.removeAttribute('width')
  })
  // #endregion
}
