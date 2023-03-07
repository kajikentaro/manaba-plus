import getOptions from '../options/models'

export default async function () {
  const { options } = await getOptions()

  if (!options.common['show-notes'].value) {
    const element = document.querySelector<HTMLElement>(
      '.memo, a[href="home_usermemo"]'
    )
    element.shown(false)
  }
}
