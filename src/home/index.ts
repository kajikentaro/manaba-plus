import getOptions from '../options/models'
import arrange from './arrange'
import hide from './hide'
import { insertHomePanel, appendAssignment } from './insert'
import getAssignments from './scrape'
import { sha256 } from '../hash'
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
  await insertHomePanel()

  const assignmentSet = new Set<string>()
  const hiddenAssignmentSet = new Set<string>(
    options.home['hidden-assignments'].value
  )

  for await (const assignment of getAssignments()) {
    const hash = await sha256(assignment.url)
    const isShown = !hiddenAssignmentSet.has(hash)

    assignmentSet.add(hash)

    Object.defineProperty(assignment, 'isShown', {
      get(): boolean {
        return isShown
      },
      set(value: boolean) {
        if (value) {
          hiddenAssignmentSet.delete(hash)
        } else {
          hiddenAssignmentSet.add(hash)
        }
        options.home['hidden-assignments'].value =
          Array.from(hiddenAssignmentSet)
      },
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
    .querySelector(
      '#assignment-list-container table.sortable th[sort-key="assignment/deadline"]'
    )
    ?.dispatchEvent(new Event('click'))

  addEventListeners()
})

// import Assignment from '../module/Assignment'
// import AssignmentViewer from '../module/AssignmentViewer'
// import {
//   HIDDEN_ASSIGNMENTS,
//   InfinityDate,
//   STORAGE_KEY_ASSIGNMENT_HISTORY,
//   STORAGE_KEY_KIKUZOU,
//   STORAGE_KEY_SEARCH_SYLLABUS,
//   STORAGE_KEY_SMARTPHONE,
//   STORAGE_KEY_STYLE_PERMISSION,
//   STORAGE_KEY_TOP_MENU,
//   URL_HOME,
// } from '../module/const'
// import * as Storage from '../module/storage'
// import { AssignmentMember, HTMLInputEvent } from '../module/type'

// /**
//  * Manabaホーム画面で動作するプログラム
//  */
// let didDisplayAssignments = false // 未提出課題一覧が表示されているかどうか

// // 初期化する。
// const init = async () => {
//   await insertMpButton()
//   await overwriteStyles()
//   await hideElements()
// }

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

// // manabaのHTML要素のstyleを上書きする。
// const overwriteStyles = async () => {}

// // 要素を非表示にする。
// const hideElements = async () => {
//
// }

// // 未提出課題一覧を表示する。
// const displayAssignments = async () => {
// }

// // manabaの未提出課題一覧から課題のリストを取得する。
// const fetchSummaries = async () => {
// }

// // 非表示の課題リストを取得する。
// const fetchHided = async () => {
//   const res = await new Promise((resolve) => {
//     chrome.storage.sync.get([HIDDEN_ASSIGNMENTS], function (result) {
//       if (!result[HIDDEN_ASSIGNMENTS]) resolve([])
//       resolve(result[HIDDEN_ASSIGNMENTS])
//     })
//   })
//   return res as string[]
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
