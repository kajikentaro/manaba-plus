import { sha256 } from 'hash'

export const getHash = async function (course: Element) {
  if (course === null) {
    return null
  }

  let hash: string = null

  const anchor = course.querySelector<HTMLAnchorElement>('.title a')
  if (anchor === null) {
    const title = course.querySelector<HTMLAnchorElement>('.title')
    if (title === null) {
      return
    }

    hash = await sha256(title.innerText)
  } else {
    hash = await sha256(anchor.href)
  }

  return hash
}
