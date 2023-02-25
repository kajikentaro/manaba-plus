import consts from '../consts'

const dateTimeRegex = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/
const parseDateTime = (str: string) => {
  const match = dateTimeRegex.exec(str)
  if (match === null) {
    return undefined
  } else {
    const [year, monthIndex, date, hours, minutes] = match
      .slice(1)
      .map((value) => parseInt(value))
    return new Date(year, monthIndex - 1, date, hours, minutes)
  }
}

const getAssignments = function* (doc: Document) {
  const rows = doc.querySelectorAll<HTMLTableRowElement>(
    'table.stdlist tr:not(.title)'
  )
  for (const row of Array.from(rows)) {
    const elements = row.children as HTMLCollectionOf<HTMLElement>
    if (elements.length < 3) {
      return
    }

    const url = elements[0].querySelector('a')?.href
    if (url === undefined) {
      continue
    }

    const texts = Array.from(elements).map((element) =>
      element.innerText.trim()
    )

    yield {
      url: url,
      name: texts[0],
      course: texts[1],
      deadline: parseDateTime(texts[2]),
    }
  }
}

const urls = [
  consts['home-url'] + '_summary_query',
  consts['home-url'] + '_summary_survey',
  consts['home-url'] + '_summary_report',
]

const domParser = new DOMParser()

export default async function* () {
  for (const url of urls) {
    const response = await fetch(url)
    const text = await response.text()
    const doc = domParser.parseFromString(text, 'text/html')
    yield* getAssignments(doc)
  }
}
