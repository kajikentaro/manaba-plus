import model from './model.json'

import getOptions from '../options/model'
import { sha256 } from '../utils/hash'

/**
 * Set a filter of a scraping root node along options.
 * @param root The root node of the scraping model
 */
const setRootFilter = async function (root: ScrapingNode) {
  const { options } = await getOptions()

  const filters: ((hash: string) => boolean)[] = []

  // Add a filter to limit to only starred courses.
  if (options.contents['contents-limit']['download-only-starred'].value) {
    const starredSet = new Set<string>(options.home['starred-courses'].value)
    filters.push((hash) => starredSet.has(hash))
  }

  // Add a filter to repel removed courses.
  if (!options.contents['contents-limit']['download-removed'].value) {
    const removedSet = new Set<string>(options.home['removed-courses'].value)
    filters.push((hash) => !removedSet.has(hash))
  }

  root.filter = async function (url) {
    const hash = await sha256(url)
    return filters.every((filter) => filter(hash))
  }
}

/**
 * Remove a specific node from the ancestor.
 * @param node The node node that has the removed descendant node
 * @param path The path to the removed node
 */
const removeNode = function (node: ScrapingNode, ...path: string[]) {
  let lastNode: ScrapingNode = node

  let parentNode: ScrapingNode = null
  let childIndex: number = null

  for (const key of path) {
    const index = lastNode.children.findIndex((node) => node.key === key)
    if (index < 0) {
      return
    }

    parentNode = lastNode
    childIndex = index

    lastNode = lastNode.children[index]
  }

  if (parentNode === null || childIndex === null) {
    return
  }

  parentNode.children.splice(childIndex, 1)
}

/**
 * Remove some nodes from a scraping root node along options.
 * @param root The root node of the scraping model
 */
const removeNodesFromRoot = async function (root: ScrapingNode) {
  const { options } = await getOptions()

  ;[
    [options.contents['contents-limit']['download-news'].value, ['news']],
    [options.contents['contents-limit']['download-report'].value, ['report']],
    [
      options.contents['contents-limit']['download-course-contents'].value,
      ['page'],
    ],
    [
      options.contents['contents-limit']['download-report-assignments'].value,
      ['report', 'assignments'],
    ],
  ].forEach(function ([enable, path]: [boolean, string[]]) {
    if (enable) {
      return
    }

    removeNode(root, ...path)
  })
}

/**
 * Return the preprocessed scraping model.
 * The scraping model expresses how to scrape pages.
 * @returns The preprocessed scraping model
 */
export default async function () {
  const clone: ScrapingNode = JSON.parse(JSON.stringify(model))

  setRootFilter(clone)
  removeNodesFromRoot(clone)

  return clone
}
