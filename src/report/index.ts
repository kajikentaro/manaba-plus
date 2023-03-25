import getOptions from '../options/model'

// Entry point.
getOptions().then(async function ({ options }) {
  if (!options.common['allow-changing'].value) {
  }
})
