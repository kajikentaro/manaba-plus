import getOptions from '../options/model'
import '../extension/htmlElement'

// Entry point
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
