import getOptions from '../options/models'

export default async function () {
  const options = await getOptions()

  const infolistTab = document.querySelector('.infolist-tab')

  const showmore = document.querySelector('.showmore')
  showmore.className = 'right-align'
  infolistTab.appendChild(showmore)

  if (options.home['move-centernews'].value) {
    const contentbodyLeft = document.querySelector('#content-body .left')
    const myInfolistCenternews = document.querySelector(
      '.my-infolist-centernews'
    )

    if (contentbodyLeft !== null && myInfolistCenternews !== null) {
      contentbodyLeft.appendChild(myInfolistCenternews)
    }
  }
}
