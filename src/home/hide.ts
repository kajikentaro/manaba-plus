import getOptions from '../options/model'
import '../extension/htmlElement'

/**
 * Hide some elements.
 */
export default async function () {
  const { options } = await getOptions()

  document.querySelector<HTMLElement>('.view-menu')?.shown(false)

  const section: OptionSection = options.home['visibility-and-movement']
  if (typeof section.children === 'undefined') {
    return
  }

  for (const { node } of section.children) {
    if (!('value' in node) || node.value !== 'hide') {
      continue
    }

    if (!('id' in node && typeof node.id === 'string')) {
      continue
    }

    const element = document.getElementById(node.id)
    if (element === null) {
      continue
    }

    element.shown(false)
  }
}
