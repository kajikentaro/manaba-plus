import getOptions from '../options/models'

import arrange from './arrange'
import hide from './hide'
import move from './move'
import { insertHomePanel, appendAssignment } from './insert'

import getAssignments from './scrape'
import addEventListeners from './event'

import Assignment from './assignment'
import dummies from './dummies.json'

// Entry point.
getOptions().then(async (options) => {
  if (!options.home['allow-changing'].value) {
    return
  }

  arrange()
  hide(options)
  move(options)
  await insertHomePanel()

  const assignmentSet = new Set<string>()
  const hiddenAssignmentSet = new Set<string>(
    options.home['hidden-assignments'].value
  )

  for await (const assignment of getAssignments()) {
    const hash = await assignment.hash

    assignmentSet.add(hash)

    assignment.isShown = !hiddenAssignmentSet.has(hash)
    assignment.onIsShownChanged.push((value) => {
      if (value) {
        hiddenAssignmentSet.delete(hash)
      } else {
        hiddenAssignmentSet.add(hash)
      }
      options.home['hidden-assignments'].value = Array.from(hiddenAssignmentSet)
    })

    appendAssignment(assignment)
  }

  for (const hash of hiddenAssignmentSet) {
    if (!assignmentSet.has(hash)) {
      hiddenAssignmentSet.delete(hash)
    }
  }

  options.home['hidden-assignments'].value = Array.from(hiddenAssignmentSet)

  for (const dummy of dummies) {
    const assignment = new Assignment(
      dummy.url,
      dummy.title,
      dummy.course,
      new Date(dummy.deadline)
    )

    appendAssignment(assignment)
  }

  document
    .querySelector('#assignment-list-deadline-header')
    ?.dispatchEvent(new Event('click'))

  addEventListeners(options)
})

// // manaba上部にManaba Plusのコンテンツを挿入する。
// const insertMpButton = async () => {
//   const enableInsertMp = await Storage.getBoolean(STORAGE_KEY_TOP_MENU)
//   if (enableInsertMp === false) return

//
//   document.getElementById('show-assignment').onclick = () => {
//     displayAssignments()
//   }
//   document.getElementById('download-content').onclick = () => {
//     if (
//       confirm(
//         'コースコンテンツをPCにまとめてダウンロードします。続行しますか？'
//       )
//     ) {
//       window.open(chrome.runtime.getURL('download-progress.html'))
//     }
//   }
//   document.getElementById('open-option').onclick = () => {
//     window.open(chrome.runtime.getURL('options.html'))
//   }
// }

// // 各コースのURLを取得する。
// const getCourseURLs = () => {
//   const manabaCourseDOMs = document.querySelectorAll<HTMLAnchorElement>(
//     '.course-cell a:first-child'
//   )
//   const courseURLs = [] as string[]
//   manabaCourseDOMs.forEach((manabaCourseDOM) => {
//     courseURLs.push(manabaCourseDOM.href)
//   })
//   return courseURLs
// }

// init()
