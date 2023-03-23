import getOptions from '../options/model'

import { insertLinkToReport } from './insert'

// Entry point.
getOptions().then(async function ({ options }) {
  if (!options.common['allow-changing'].value) {
    return
  }

  await insertLinkToReport()
})
