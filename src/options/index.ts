import getOptions from './models'

import insertOptions from './insert'
import addEventListeners from './event'

// Get option path from current URL query params.
const url = new URL(location.href)
const optionPath = url.searchParams.get('path')

console.info('Not Implementation: ' + optionPath)

// Entry point.
getOptions().then(async () => {
  await insertOptions()
  await addEventListeners()
})
