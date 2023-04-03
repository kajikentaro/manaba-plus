import getOptions from '../options/model'

import insert from './insert'

// Entry point.
getOptions().then(async function ({ options }) {
  if (!options.common['allow-changing'].value) {
    return
  }

  insert()
})
