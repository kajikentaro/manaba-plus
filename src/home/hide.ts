const hide = (selectors: string) => {
  document.querySelectorAll<HTMLElement>(selectors).forEach((element) => {
    element.style.display = 'none'
  })
}

export default (options) => {
  const showSyllabus = options.home['show-syllabus'].value
  const showAssignment = options.home['show-assignment'].value
  const showFormerLink = options.home['show-former-link'].value
  const showKikuzou = options.home['show-kikuzou'].value

  if (!showSyllabus) {
    hide('.my-infolist-searchall')
  }

  if (!showAssignment) {
    hide('.my-infolist-event')
  }

  if (!showFormerLink) {
    hide('.my-infolist-tips:not(.my-infolist-kikuzou)')
  }

  if (!showKikuzou) {
    hide('.my-infolist-kikuzou')
  }

  // If all elements on the right side were hidden, collapse them.
  if (
    ![showSyllabus, showAssignment, showFormerLink, showKikuzou].includes(true)
  ) {
    const contentbodyLeft =
      document.querySelector<HTMLAnchorElement>('.contentbody-left')
    if (contentbodyLeft !== null) {
      contentbodyLeft.style.width = '916px'
    }

    const myInfolistHeader = document.querySelector<HTMLAnchorElement>(
      '.my-infolist-mycourses .my-infolist-header'
    )
    if (myInfolistHeader !== null) {
      myInfolistHeader.style.paddingLeft = '10px'
    }

    document
      .querySelectorAll<HTMLAnchorElement>('.course')
      .forEach((element) => {
        element.style.height = '60px'
      })
  }
}
