import getOptions from '../options/model'
import * as time from '../utils/time'
import { messages, pushMessages } from '../utils/messages'

const storageKey = 'last-download-date'

export const updateDate = async function () {
  await chrome.storage.local.set({ [storageKey]: Date.now() })
}

export const getLastDate = async function () {
  const pairs = await chrome.storage.local.get({ [storageKey]: null })
  return pairs[storageKey] as number
}

export const pushMessage = async function () {
  const lastDate = await getLastDate()
  if (lastDate === null) {
    return
  }

  const { options } = await getOptions()

  const dayCount = time.dayCount(Date.now() - lastDate)
  if (dayCount > options['main-panel'].messages['download-interval'].value) {
    await pushMessages(
      messages.download.replace('$dayCount$', Math.floor(dayCount).toString())
    )
  }
}
