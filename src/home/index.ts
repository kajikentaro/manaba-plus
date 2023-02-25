import getOptions from '../options/models'

import arrange from './arrange'
import hide from './hide'
import getAssignments from './scrape'

// Entry point.
getOptions().then(async (options) => {
  if (!options.home['allow-changing'].value) {
    return
  }

  arrange()
  hide(options)

  for await (const assignment of getAssignments()) {
    console.log(assignment)
  }
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

//   const mark = document.getElementsByClassName('contentbody-left')[0]
//   mark.insertAdjacentHTML(
//     'afterbegin',
//     await (await fetch(chrome.runtime.getURL('index.html'))).text()
//   )
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
