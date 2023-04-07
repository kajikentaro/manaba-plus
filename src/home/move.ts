import getOptions from '../options/model'

/**
 * Move some elements.
 */
export default async function () {
  const { options } = await getOptions()

  const contentBody = document.querySelector('#content-body')

  const bottom = document.createElement('div')
  bottom.className = 'bottom'

  const section: OptionSection = options.home['visibility-and-movement']
  if (typeof section.children === 'undefined') {
    return
  }

  for (const { node } of section.children) {
    if (!('value' in node) || node.value !== 'move') {
      continue
    }

    if (!('id' in node && typeof node.id === 'string')) {
      continue
    }

    const element = document.getElementById(node.id)
    if (element === null) {
      continue
    }

    bottom.appendChild(element)
  }

  contentBody.appendChild(bottom)

  // #region infolist-tab
  const infolistTab = document.querySelector('.infolist-tab')

  const showmore = document.querySelector('.showmore')
  showmore.className = 'right-align'
  infolistTab.appendChild(showmore)
  // #endregion
}
