import getOptions from '../options/models'

import arrange from './arrange'
import hide from './hide'

// Entry point.
getOptions().then(async function (options) {
  if (!options.common['allow-changing'].value) {
    return
  }

  await arrange()
  await hide()
})
