export default (options) => {
  if (options.home['move-centernews'].value) {
    const contentbodyLeft = document.querySelector('.contentbody-left')
    const myInfolistCenternews = document.querySelector(
      '.my-infolist-centernews'
    )

    if (contentbodyLeft !== null && myInfolistCenternews !== null) {
      contentbodyLeft.appendChild(myInfolistCenternews)
    }
  }
}
