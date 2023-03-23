import getOptions from '../options/model'

const externalUrlRegex = /url=(.+)/

const overwriteExternalUrl = function (element: HTMLAnchorElement) {
  const match = externalUrlRegex.exec(element.href)
  if (match === null) {
    return
  }

  const anchor = document.createElement('a')
  anchor.href = decodeURIComponent(match[1])
  anchor.textContent = element.textContent
  element.replaceWith(anchor)
}

export default async function () {
  const { options } = await getOptions()

  if (options.common['transition-directly'].value) {
    document
      .querySelectorAll<HTMLAnchorElement>('a[href^="link"]')
      .forEach(overwriteExternalUrl)
  }
}
