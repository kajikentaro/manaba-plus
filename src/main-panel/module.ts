import { compileTemplate } from 'pug'
import pushNotifications from '../notification/push-notifications'
import * as insert from './insert'
import * as event from './event'

/**
 * Initialize the main panel.
 * @param parent The parent element of the main panel
 */
export default async function (parent: Element) {
  const module: compileTemplate = require('./module.pug')
  parent.insertAdjacentHTML('afterbegin', module())

  await pushNotifications()
  await insert.insertMainComponents()
  await event.addMainActions()
}
