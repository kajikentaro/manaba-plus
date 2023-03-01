export const fetchText = async function (url: string) {
  const response = await fetch(url)
  return await response.text()
}

const domParser = new DOMParser()

export const fetchDOM = async function (url: string) {
  const text = await fetchText(url)
  const doc = domParser.parseFromString(text, 'text/html')

  // Set base URL to resolve hyperlinks correctly.
  const base = doc.createElement('base')
  base.href = url
  doc.head.appendChild(base)

  return doc
}
