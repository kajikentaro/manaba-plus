import { fetchText } from 'fetch'

export default async function (
  parent: Element,
  position: InsertPosition,
  path: string
) {
  const moduleUrl = chrome.runtime.getURL(path)
  const moduleText = await fetchText(moduleUrl)
  parent.insertAdjacentHTML(position, moduleText)
}
