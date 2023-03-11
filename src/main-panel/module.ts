import * as insert from './insert'
import * as event from './event'

export default async function () {
  await insert.insertMainComponents()
  await event.addMainActions()

  document
    .querySelector('#assignment-list-deadline-header')
    ?.dispatchEvent(new Event('click'))
}
