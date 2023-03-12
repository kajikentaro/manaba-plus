import pushNotifications from '../notification/push-notifications'
import * as insert from './insert'
import * as event from './event'

export default async function () {
  await pushNotifications()
  await insert.insertMainComponents()
  await event.addMainActions()

  document
    .querySelector('#assignment-list-deadline-header')
    ?.dispatchEvent(new Event('click'))
}
