import getOptions from '../options/models'

import arrange from './arrange'
import replace from './replace'
import hide from './hide'
import move from './move'
import insert from './insert'
import event from './event'
import module from 'main-panel/module'

// Entry point.
getOptions().then(async function ({ options }) {
  if (!options.common['allow-changing'].value) {
    return
  }

  await arrange()
  replace()
  await hide()
  await move()
  await insert()
  await event()
  await module()
})
