import getOptions from '../options/models'
import { getHash } from './course'
import '../extension/htmlElement'

export default async function () {
  const { options } = await getOptions()

  const removedCourseSet = new Set<string>(
    options.home['removed-courses'].value
  )

  document
    .querySelectorAll<HTMLElement>('.course')
    .forEach(async function (course) {
      const hash = await getHash(course)
      if (hash === null) {
        return
      }

      if (!removedCourseSet.has(hash)) {
        return
      }

      if (course.classList.contains('cell')) {
        const dummyCell = document.createElement('td')
        course.replaceWith(dummyCell)
      } else {
        course.shown(false)
      }
    })
}
