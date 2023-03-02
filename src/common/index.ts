import getOptions from '../options/models'

import replace from './replace'
import hide from './hide'

// Entry point.
getOptions().then(async function (options) {
  if (!options.common['allow-changing'].value) {
    return
  }

  await replace()
  await hide()
})
