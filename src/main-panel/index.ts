import insertModule from '../utils/insert-module'
import module from './module'
;(async function () {
  await insertModule(document.body, 'afterbegin', '/main-panel/module.html')
  await module()
})()
