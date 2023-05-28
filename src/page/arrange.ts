import getOptions from '../options/model'

/**
 * Highlight the open period.
 */
const highlightOpenPeriod = async function () {
  const { options } = await getOptions()

  if (!options['resources-page']['highlight-open-period'].value) {
    return
  }

  document.querySelector('.pagelimitview')?.classList?.add('highlight')
}

// Entry point
export default async function () {
  await highlightOpenPeriod()
}
