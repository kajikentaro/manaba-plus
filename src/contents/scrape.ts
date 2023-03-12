import { fetchDOM } from '../utils/fetch'
import consts from '../consts'
import getModel from './model'
import './model.type'

let isScraping = false
let returnContext: (context: DownloadContext) => void = null

/**
 * for createProgress
 */
export let currentTraces: ScrapingTrace[] = null
export let fetchCount = 0

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

export const startScraping = async function (
  callback: (context: DownloadContext) => void
) {
  if (isScraping) {
    return
  }

  isScraping = true
  returnContext = callback

  currentTraces = null
  fetchCount = 0

  const model = await getModel()

  const homeUrl = consts['home-url']
  const homeDoc = await fetchDOM(homeUrl)

  await scrape(model, homeDoc, [])

  isScraping = false
}

export const stopScraping = function () {
  isScraping = false
}
