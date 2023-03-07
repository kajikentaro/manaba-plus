export default function () {
  // #region To show background image.
  const orgheader = document.querySelector<HTMLElement>('#orgheader')
  if (orgheader !== null) {
    orgheader.style.backgroundColor = 'transparent'
  }

  const pagebody = document.querySelector<HTMLElement>('.pagebody')
  if (pagebody !== null) {
    pagebody.style.borderStyle = 'none'
  }
  // #endregion

  // #region Make responsible.

  // #endregion
}
