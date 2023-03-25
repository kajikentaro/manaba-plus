import { fetchDOM } from 'utils/fetch'
import getDistance from '../lib/edit-distance-onp'

/**
 * Insert a link from a grade to the assignment.
 * Determine if the grade is related to the assignment with the string distance.
 */
export const insertLinkToReport = async function () {
  const reportsUrl = location.href.replace(/_grade$/, '_report')
  const reportsDom = await fetchDOM(reportsUrl)

  const reportAnchors =
    reportsDom.querySelectorAll<HTMLAnchorElement>('.report-title a')
  const reportItems = Array.from(reportAnchors).map(function (anchor) {
    const reportUrl = anchor.href
    const reportTitle = anchor.textContent
    return { reportUrl, reportTitle }
  })

  /**
   * Find the report item related to the specific grade item.
   * @param gradeTitle The title of the grade item
   * @returns The closest report item from the title
   */
  const getReportUrl = async function (gradeTitle: string) {
    const sortedItems = reportItems
      .map(function ({ reportUrl, reportTitle }) {
        const distance = getDistance(reportTitle, gradeTitle)
        return { distance, reportUrl }
      })
      .filter((item) => item.distance < 0.6)
      .sort((a, b) => a.distance - b.distance)

    if (sortedItems.length === 0) {
      return null
    } else {
      return sortedItems[0].reportUrl
    }
  }

  const rows = document.querySelectorAll('tr[class*="row"]')
  const ownRows = Array.from(rows).filter((_, index) => index % 2 === 0)

  for (const ownRow of ownRows) {
    const gradeTitle =
      ownRow.querySelector<HTMLElement>('.grade-title')?.textContent
    if (typeof gradeTitle === 'undefined') {
      continue
    }

    const grade = ownRow.querySelector('.grade')
    if (grade === null || grade.children.length > 0) {
      continue
    }

    const reportUrl = await getReportUrl(gradeTitle)
    if (reportUrl === null) {
      continue
    }

    const br = document.createElement('br')
    grade.appendChild(br)

    const gradeAnchor = document.createElement('a')
    gradeAnchor.className = 'grade-anchor'
    gradeAnchor.href = reportUrl
    grade.appendChild(gradeAnchor)
  }
}
