export const fetchText = async (url: string) => {
  const response = await fetch(url)
  return await response.text()
}

const domParser = new DOMParser()

export const fetchDOM = async (url: string) => {
  const text = await fetchText(url)
  return domParser.parseFromString(text, 'text/html')
}
