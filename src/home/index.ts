import getOptions from '../options/models'

import arrange from './arrange'
import replace from './replace'
import hide from './hide'
import move from './move'
import remove from './remove'
import insert from './insert'

import addEventListeners from './event'

// Entry point.
getOptions().then(async function ({ options }) {
  if (!options.common['allow-changing'].value) {
    return
  }

  await arrange()
  replace()
  await hide()
  await move()
  await remove()
  await insert()

  document
    .querySelector('#assignment-list-deadline-header')
    ?.dispatchEvent(new Event('click'))

  await addEventListeners()
})
