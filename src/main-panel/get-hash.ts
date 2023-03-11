import { sha256 } from 'hash'

export default async function (element: Element) {
  if (element === null) {
    return null
  }

  let hash: string = null

  const anchor = element.querySelector<HTMLAnchorElement>('.title a')
  if (anchor === null) {
    const title = element.querySelector<HTMLAnchorElement>('.title')
    if (title === null) {
      return
    }

    hash = await sha256(title.innerText)
  } else {
    hash = await sha256(anchor.href)
  }

  return hash
}
