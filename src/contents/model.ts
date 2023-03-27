import model from './model.json'

import getOptions from '../options/model'
import { sha256 } from '../utils/hash'

/**
 * Remove a specific node from the ancestor.
 * @param root The root node that has the removed descendant node
 * @param path The path to the removed node
 */
const removeNode = function (root: ScrapingNode, ...path: string[]) {
  let lastNode: ScrapingNode = root

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
 * Return the preprocessed scraping model.
 * The scraping model expresses how to scrape pages.
 * @returns The preprocessed scraping model
 */
export default async function () {
  const { options } = await getOptions()

  const clone: ScrapingNode = JSON.parse(JSON.stringify(model))

  // Set a filter that repels removed courses.
  if (!options.contents['contents-limit']['download-removed'].value) {
    const removedCourseSet = new Set(options.home['removed-courses'].value)
    clone.filter = async function (url) {
      const hash = await sha256(url)
      return !removedCourseSet.has(hash)
    }
  }

  // #region Remove nodes
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

    removeNode(clone, ...path)
  })
  // #endregion

  return clone
}
