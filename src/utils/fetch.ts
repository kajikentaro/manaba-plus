/**
 * Fetch a text from a specific URL.
 * @param url The target URL
 * @param options The request options
 * @returns The response text
 */
export const fetchText = async function (url: string, options?: RequestInit) {
  const response = await fetch(url, options)
  return await response.text()
}

const domParser = new DOMParser()

/**
 * Fetch a text as a DOM document from a specific URL.
 * The document is injected `base` element and set the URL.
 * @param url The target URL
 * @param options The request options
 * @returns The document
 */
export const fetchDOM = async function (url: string, options?: RequestInit) {
  const text = await fetchText(url, options)
  const doc = domParser.parseFromString(text, 'text/html')

  // Set base URL to resolve hyperlinks correctly.
  const base = doc.createElement('base')
  base.href = url
  doc.head.appendChild(base)

  return doc
}
