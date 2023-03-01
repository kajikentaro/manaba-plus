export default function () {
  const orgheader = document.querySelector<HTMLElement>('#orgheader')
  if (orgheader !== null) {
    orgheader.style.backgroundColor = 'transparent'
  }

  const pagebody = document.querySelector<HTMLElement>('.pagebody')
  if (pagebody !== null) {
    pagebody.style.borderStyle = 'none'
  }

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
    .forEach(function (element) {
      element.style.backgroundSize = '100% 100%'
    })

  document
    .querySelectorAll<HTMLElement>('.courselist')
    .forEach(function (element) {
      const tableHeaders = element.querySelectorAll('th')

      const widths = ['auto', '50px', '50px', '20%']
      for (let i = 0; i < 4; i++) {
        tableHeaders[i].setAttribute('width', widths[i])
      }
    })

  console.log('Arranged!')
}
