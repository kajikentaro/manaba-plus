import getOptions from '../options/models'

export default async function () {
  const { options } = await getOptions()

  const contentBodyLeft = document.querySelector('#content-body .left')

  const container = document.createElement('div')
  container.className = 'wrap-box space-evenly'

  const items = [
    options.home['visibility-and-movement']['hide-or-move-alert'],
    options.home['visibility-and-movement']['hide-or-move-centernews'],
    options.home['visibility-and-movement']['hide-or-move-syllabus'],
    options.home['visibility-and-movement']['hide-or-move-assignment'],
    options.home['visibility-and-movement']['hide-or-move-former-link'],
    options.home['visibility-and-movement']['hide-or-move-kikuzou'],
    options.home['visibility-and-movement']['hide-or-move-banner-list'],
  ]
  for (const item of items) {
    if (item.value !== 'move') {
      continue
    }

    const element = document.getElementById(item.id)
    container.appendChild(element)
  }

  contentBodyLeft.appendChild(container)

  // #region infolist-tab
  const infolistTab = document.querySelector('.infolist-tab')

  const showmore = document.querySelector('.showmore')
  showmore.className = 'right-align'
  infolistTab.appendChild(showmore)
  // #endregion
}
