import { fetchDOM } from '../utils/fetch'
import getModel from './model'
import './model.type'
import getOptions from '../options/model'

let isScraping = false

/**
 * A callback called when returning items.
 */
let returnContext: (context: DownloadContext) => void = null

/**
 * Traces to create and show progress.
 */
export let currentTraces: ScrapingTrace[] = null
export let fetchCount = 0

/**
 * Search URLs in a document and fetch the next pages in accordance with a scraping node.
 * Return items through the callback `returnContext` if the node has no children.
 * @param node The scraping node navigating the next pages
 * @param doc The DOM document that URLs are found
 * @param traces Traces passed from the parent scraping
 */
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
    anchor.textContent.trim(),
  ])

  if (typeof node.filter !== 'undefined') {
    const temp = items.splice(0)
    for (const item of temp) {
      const [url] = item
      if (await node.filter(url)) {
        items.push(item)
      }
    }
  }

  if (typeof node.children === 'undefined') {
    const parentUrl = doc.baseURI

    for (const [url, token] of items) {
      const context = {
        parentUrl,
        url,
        tokens: [token, ...traces.map((trace) => trace.token)],
      }

      returnContext(context)
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

        fetchCount++
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

/**
 * Start scraping with the scraping model.
 * Result items are sent with a callback.
 * @param callback The callback to get items
 */
export const startScraping = async function (
  callback: (context: DownloadContext) => void
) {
  if (isScraping) {
    return
  }

  const { options } = await getOptions()

  isScraping = true
  returnContext = callback

  currentTraces = null
  fetchCount = 0

  const model = await getModel()

  const homeUrl = options.common['root-url'].value + 'home'
  const homeDoc = await fetchDOM(homeUrl)

  await scrape(model, homeDoc, [])

  isScraping = false
}

export const stopScraping = function () {
  isScraping = false
}
