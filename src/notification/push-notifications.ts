import getOptions from '../options/model'
import version from './version'
import * as download from './download'

/**
 * Push some notifications if they are allowed.
 */
export default async function () {
  const { options } = await getOptions()

  if (options['main-panel'].messages['notify-version'].value) {
    await version()
  }

  if (
    options['main-panel'].messages['download-interval'].value.toString() !== ''
  ) {
    await download.pushMessage()
  }
}
