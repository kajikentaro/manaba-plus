import getOptions from './models'

import insert from './insert'
import event from './event'

// Get option path from current url query params.
const url = new URL(location.href)
const optionPath = url.searchParams.get('path')

console.info('Not Implementation: ' + optionPath)

// Entry point.
getOptions().then(async function () {
  await insert()
  await event()
})
