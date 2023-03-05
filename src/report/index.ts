import getOptions from '../options/models'

// Entry point.
getOptions().then(async function (options) {
  if (!options.common['allow-changing'].value) {
  }
})
