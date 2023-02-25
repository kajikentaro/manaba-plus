export default () => {
  const contentbodyLeft =
    document.querySelector<HTMLElement>('.contentbody-left')
  if (contentbodyLeft !== null) {
    contentbodyLeft.style.width = '671px'
    contentbodyLeft.style.paddingRight = '15px'
  }

  const courselistweekly =
    document.querySelector<HTMLElement>('#courselistweekly')
  if (courselistweekly !== null) {
    courselistweekly.style.paddingRight = '0px'
  }
  document
    .querySelectorAll<HTMLElement>('.my-infolist-header')
    .forEach((element) => {
      element.style.backgroundSize = '100% 100%'
    })

  document.querySelectorAll<HTMLElement>('.courselist').forEach((element) => {
    const tableHeaders = element.querySelectorAll('th')

    const widths = ['auto', '50px', '50px', '20%']
    for (let i = 0; i < 4; i++) {
      tableHeaders[i].setAttribute('width', widths[i])
    }
  })
}
