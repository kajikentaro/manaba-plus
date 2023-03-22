import { compileTemplate } from 'pug'
import pushNotifications from '../notification/push-notifications'
import * as insert from './insert'
import * as event from './event'

export default async function (parent: Element) {
  const module: compileTemplate = require('./module.pug')
  parent.insertAdjacentHTML('afterbegin', module())

  await pushNotifications()
  await insert.insertMainComponents()
  await event.addMainActions()
}
