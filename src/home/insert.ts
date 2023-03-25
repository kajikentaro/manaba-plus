import { compileTemplate } from 'pug'
import * as insert from '../main-panel/insert'

/**
 * Apply some styles that cannot be in `style.scss` because of Webpack resolving paths.
 */
const insertStyle = function () {
  const head = document.querySelector('head')
  const style = document.createElement('style')
  style.textContent = `
      .course .star {
        background-image: url(../icon_clip_on.png);
      }
  `
  head.appendChild(style)
}

// Entry point
export default async function () {
  insertStyle()
  document.querySelectorAll('.course .actions').forEach(insert.insertRemove)

  const parent = document.querySelector('.mycourses-body')
  const module: compileTemplate = require('./module.pug')
  parent.insertAdjacentHTML('afterbegin', module())
}
