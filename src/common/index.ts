import getOptions from '../options/models'

import arrange from './arrange'
import replace from './replace'
import hide from './hide'

// Entry point.
getOptions().then(async function (options) {
  if (!options.common['allow-changing'].value) {
    return
  }

  arrange()
  await replace()
  await hide()
})
