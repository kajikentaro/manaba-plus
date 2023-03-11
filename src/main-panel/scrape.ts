import consts from '../consts'
import { fetchDOM } from '../fetch'
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
      element.innerText.trim()
    )

    yield new Assignment(url, texts[0], texts[1], parseDateTime(texts[2]))
  }
}

const urls = [
  consts['home-url'] + '_summary_query',
  consts['home-url'] + '_summary_survey',
  consts['home-url'] + '_summary_report',
]

export default async function* () {
  for (const url of urls) {
    const doc = await fetchDOM(url)
    yield* getAssignmentsFromDoc(doc)
  }
}
