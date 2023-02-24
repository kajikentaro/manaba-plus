import options from './models.json'

export default async () => {
  // Flatten option items.
  const items = {}

  const sectionQueue = [options]
  while (sectionQueue.length) {
    const section = sectionQueue.pop()

    const keys = Object.keys(section).slice(1)

    keys.forEach((key) => {
      const item = section[key]

      // If `item` is a section...
      if ('title' in item) {
        sectionQueue.push(item)
      } else {
        items[key] = item
      }
    })
  }

  // Get stored values.
  const pairs = await chrome.storage.sync.get(Object.keys(items))

  for (const key in pairs) {
    items[key].value = pairs[key]
  }

  // Add setter in items.
  for (const key in items) {
    const item = items[key]

    item._value = item.value
    Object.defineProperty(item, 'value', {
      get() {
        return this._value
      },
      set(value) {
        if (this._value !== value) {
          chrome.storage.sync.set({ key: value })
          this._value = value
        }
      },
    })
  }

  console.log(options)
  return options
}

// import {
//   DOWNLOAD_LIST,
//   HIDDEN_ASSIGNMENTS,
//   STORAGE_KEY_ASSIGNMENT_HISTORY,
//   STORAGE_KEY_KIKUZOU,
//   STORAGE_KEY_SEARCH_SYLLABUS,
//   STORAGE_KEY_SMARTPHONE,
//   STORAGE_KEY_STYLE_PERMISSION,
//   STORAGE_KEY_TOP_MENU,
// } from "./module/const"
// import * as Storage from "./module/storage"
// import { BooleanStorageKey, HTMLInputEvent } from "./module/type"

// /**
//  * Manaba Plus オプション画面のボタン動作を定義するプログラム
//  */
// document
//   .getElementById("delete-download-history")
//   .addEventListener("click", () => {
//     if (!confirm("よろしいですか？")) return
//     chrome.storage.local.set({ [DOWNLOAD_LIST]: [] }, () => {
//       alert("完了")
//     })
//   })
// document.getElementById("reset-hidden-ass").addEventListener("click", () => {
//   if (!confirm("よろしいですか？")) return
//   chrome.storage.sync.set({ [HIDDEN_ASSIGNMENTS]: [] }, () => {
//     alert("完了")
//   })
// })
// document.getElementById("contents-download").addEventListener("click", () => {
//   window.open("download-progress.html")
// })
