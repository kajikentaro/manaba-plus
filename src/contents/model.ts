import model from './model.json'

import getOptions from '../options/model'
import { sha256 } from '../utils/hash'

export default async function () {
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
