import getOptions from '../options/model'
import { fetchDOM } from '../utils/fetch'
import Assignment from './assignment'

const dateTimeRegex = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/
const parseDateTime = function (str: string) {
  const match = dateTimeRegex.exec(str)
  if (match === null) {
    return null
  } else {
    const [year, monthIndex, date, hours, minutes] = match
      .slice(1)
      .map((value) => parseInt(value))
    return new Date(year, monthIndex - 1, date, hours, minutes)
  }
}

const getAssignmentsFromDoc = function* (doc: Document) {
  const rows = doc.querySelectorAll<HTMLTableRowElement>(
    'table.stdlist tr:not(.title)'
  )
  for (const row of Array.from(rows)) {
    const elements = row.children
    if (elements.length < 3) {
      return
    }

    const url = elements[0].querySelector('a')?.href
    if (typeof url === 'undefined') {
      continue
    }

    const texts = Array.from(elements).map((element: HTMLElement) =>
      element.textContent.trim()
    )

    yield new Assignment(url, texts[0], texts[1], parseDateTime(texts[2]))
  }
}

export default async function* () {
  const { options } = await getOptions()

  const rootUrl = options.common['root-url'].value

  const urls = [
    rootUrl + 'home_summary_query',
    rootUrl + 'home_summary_survey',
    rootUrl + 'home_summary_report',
  ]

  for (const url of urls) {
    const doc = await fetchDOM(url)
    yield* getAssignmentsFromDoc(doc)
  }
}
