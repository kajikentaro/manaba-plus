import getOptions from '../options/models'
import '../extension/htmlElement'

export default async function () {
  const { options } = await getOptions()

  if (!options.common['show-notes'].value) {
    document
      .querySelectorAll<HTMLElement>('.memo, a[href="home_usermemo"]')
      .forEach(function (element) {
        element.shown(false)
      })
  }
}
