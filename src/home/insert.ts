import insertModule from '../utils/insert-module'
import * as insert from '../main-panel/insert'

const insertStyle = function () {
  const head = document.querySelector('head')
  head.insertAdjacentHTML(
    'beforeend',
    `
    <style>
      .course .star {
        background-image: url(../icon_clip_on.png);
      }
    </style>
  `
  )
}

export default async function () {
  insertStyle()
  document.querySelectorAll('.course .actions').forEach(insert.insertRemove)
  await insertModule(
    document.querySelector('#content-body .left'),
    'afterbegin',
    '/main-panel/module.html'
  )
  await insertModule(
    document.querySelector('.mycourses-body'),
    'afterbegin',
    '/home/module.html'
  )
}
