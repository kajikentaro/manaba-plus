import model from './scrape.json'
import './scrape.type'

import { fetchDOM } from '../utils/fetch'
import consts from '../consts'
import getOptions from '../options/model'
import { sha256 } from '../utils/hash'

let isScraping = false
let returnContext: (context: DownloadContext) => void = null

/**
 * for createProgress
 */
export let currentTraces: ScrapingTrace[] = null
export let fetchCount = 0

const getModel = async function () {
  const { options } = await getOptions()

  const clone: ScrapingNode = JSON.parse(JSON.stringify(model))

  if (!options.contents['contents-limit']['download-removed'].value) {
    const removedCourseSet = new Set(options.home['removed-courses'].value)
    clone.filter = async function (url) {
      const hash = await sha256(url)
      return !removedCourseSet.has(hash)
    }
  }

  ;[
    [options.contents['contents-limit']['download-news'].value, '_news'],
    [options.contents['contents-limit']['download-report'].value, '_report'],
    [
      options.contents['contents-limit']['download-course-contents'].value,
      '_page',
    ],
  ].forEach(function ([enable, prefix]) {
    if (enable) {
      return
    }

    const index = clone.children.findIndex((node) => node.prefix === prefix)
    clone.children.splice(index, 1)
  })

  return clone
}

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
