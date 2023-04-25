import getOptions from '../options/model'
import replace from './replace'
import insert from './insert'
import event from './event'

// Entry point.
getOptions().then(async function ({ options }) {
  if (!options.common['allow-changing'].value) {
    return
  }

  replace()
  insert()
  event()
})
