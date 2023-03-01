import models from './scrape.json'
import './scrape.type'

import { fetchDOM } from '../fetch'
import consts from '../consts'

export let currentTraces: ScrapingTrace[] = null

export const getContents = async function* () {
  const nodeStack: [ScrapingNode, string, ScrapingTrace[]][] = [
    [models, consts['home-url'], []],
  ]
  while (nodeStack.length) {
    // Send dummy data to stop immediately.
    yield null

    const [node, url, traces] = nodeStack.pop()
    currentTraces = traces

    const doc = await fetchDOM(url)
    const anchors = doc.querySelectorAll<HTMLAnchorElement>(node.selectors)
    const items = Array.from(anchors).map((anchor) => [
      anchor.href,
      anchor.innerText.trim(),
    ])

    if (typeof node.children === 'undefined') {
      for (const [subURL, token] of items) {
        yield {
          url: subURL,
          tokens: [token, ...traces.map((trace) => trace.token)],
        }
      }
    } else {
      for (const child of node.children) {
        let prefix = ''
        if ('prefix' in child) {
          prefix = child.prefix as string
        }

        for (let index = 0; index < items.length; index++) {
          const [subUrl, token] = items[index]
          const max = items.length
          const trace: ScrapingTrace = { token, max, index }

          nodeStack.push([child, subUrl + prefix, [trace, ...traces]])
        }
      }
    }
  }

  currentTraces = null
}
