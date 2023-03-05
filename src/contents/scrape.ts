import models from './scrape.json'
import './scrape.type'

import { fetchDOM } from '../fetch'
import consts from '../consts'

let isScraping = false
let returnContent: (content: DownloadContext) => void = null

export let currentTraces: ScrapingTrace[] = null

const scrape = async function (
  node: ScrapingNode,
  doc: Document,
  traces: ScrapingTrace[]
) {
  if (!isScraping) {
    return
  }

  currentTraces = traces

  const anchors = doc.querySelectorAll<HTMLAnchorElement>(node.selectors)
  const items = Array.from(anchors).map((anchor) => [
    anchor.href,
    anchor.innerText.trim(),
  ])

  if (typeof node.children === 'undefined') {
    for (const [url, token] of items) {
      returnContent({
        url,
        tokens: [token, ...traces.map((trace) => trace.token)],
      })
    }
  } else {
    const promises: Promise<void>[] = []

    for (let index = 0; index < items.length; index++) {
      const item = items[index]
      const [url, token] = item
      const max = items.length
      const trace: ScrapingTrace = { token, max, index }

      const docMap = new Map<string, Document>()

      for (const child of node.children) {
        const prefix = child.prefix ?? ''
        if (docMap.has(prefix)) {
          continue
        }

        const doc = await fetchDOM(url + prefix)
        docMap.set(prefix, doc)
      }

      for (const child of node.children) {
        const prefix = child.prefix ?? ''
        const doc = docMap.get(prefix)

        const promise = scrape(child, doc, [trace, ...traces])
        promises.push(promise)
      }
    }

    await Promise.all(promises)
  }
}

export const startScraping = async function (
  callback: (DownloadContext) => void
) {
  if (isScraping) {
    return
  }

  isScraping = true
  returnContent = callback

  currentTraces = null

  const homeUrl = consts['home-url']
  const homeDoc = await fetchDOM(homeUrl)

  await scrape(models, homeDoc, [])
}

export const stopScraping = function () {
  isScraping = false
}
