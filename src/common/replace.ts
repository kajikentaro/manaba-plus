import getOptions from '../options/model'

/**
 * Extract the external URL and replace an anchor element with a new one.
 * @param pastAnchor The anchor element replaced with
 */
const overwriteExternalUrl = function (pastAnchor: HTMLAnchorElement) {
  // Extract the external URL.
  const match = /url=(.+)/.exec(pastAnchor.href)
  if (match === null) {
    return
  }

  const anchor = document.createElement('a')
  anchor.href = decodeURIComponent(match[1])
  anchor.textContent = pastAnchor.textContent
  pastAnchor.replaceWith(anchor)
}

// Entry point
export default async function () {
  const { options } = await getOptions()

  if (options.common['transition-directly'].value) {
    document
      .querySelectorAll<HTMLAnchorElement>('a[href^="link"]')
      .forEach(overwriteExternalUrl)
  }
}
