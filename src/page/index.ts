import getOptions from '../options/model'
import arrange from './arrange'

// Entry point.
getOptions().then(async function ({ options }) {
  if (!options.common['allow-changing'].value) {
    return
  }

  await arrange()
})
