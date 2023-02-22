import options from "./models.json"

// Flatten option items.
const items = {}

const sectionQueue = [options]
while (sectionQueue.length) {
  const section = sectionQueue.pop()

  const keys = Object.keys(section).slice(1)

  keys.forEach((key) => {
    const item = section[key]
    if ("title" in item) {
      sectionQueue.push(item)
    } else {
      items[key] = item
    }
  })
}

// Get stored values.
chrome.storage.sync.get(Object.keys(items), (pairs) => {
  for (const key in pairs) {
    items[key].value = pairs[key]
  }
})

// Add setter in items.
for (const key in items) {
  const item = items[key]

  item._value = item.value
  Object.defineProperty(item, "value", {
    get() {
      return this._value
    },
    set(value) {
      if (this._value !== value) {
        chrome.storage.sync.set({ [key]: value })
        this._value = value
      }
    },
  })
}

console.log(options)
export default options

// class Section {
//   constructor(
//     public title: string,
//     public items: Item[],
//   ) { }
// }

// const convertSection = (section) => {
//   if ('title' in section) {
//     const keys = Object.keys(section).slice(1)

//     keys.forEach(key => {
//       section[key] = convertSection(section[key])
//     })

//     return section
//   }
//   else {
//     const defaultValue = section.value
//     if (defaultValue === undefined) {
//       throw new Error('Missing default value of ' + section.hint)
//     }

//     delete section.value
//     return Object.assign(new Item(defaultValue), section)
//   }
// }

// const options = convertSection(_options)

// console.log(options)
// console.log(_options)

// _options.contents["delete-history"].value

// const options = _options.map(section => {
//   return new Section(
//     section.title,
//     section.items.map(item => {
//       return Object.assign(new Item(), item)
//     })
//   )
// })

// const options = [
//   new Section('', [
//     new Item(
//       'show-home-panel',
//       'ホームパネルを表示する',
//       'チェックを入れると、ホーム画面にManaba Plusの見出しとボタンが表示されます。チェックが入っていないときにこのページを訪れるには、拡張機能アイコンをクリックします。',
//       'checkbox',
//       true
//     ),
//     new Item(
//       'show-home-panel',
//       'ホーム画面にManaba Plusのパネルを表示するかどうか',
//       'チェックを入れると、ホーム画面にManaba Plusの見出しとボタンが表示されます。チェックが入っていないときにこのページを訪れるには、拡張機能アイコンをクリックします。',
//       'checkbox',
//       true
//     ),
//     new Item(
//       'show-home-panel',
//       'ホーム画面にManaba Plusのパネルを表示するかどうか',
//       'チェックを入れると、ホーム画面にManaba Plusの見出しとボタンが表示されます。チェックが入っていないときにこのページを訪れるには、拡張機能アイコンをクリックします。',
//       'checkbox',
//       true
//     ),
//   ])
// ]

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

// const bindBoolean = async (key: BooleanStorageKey) => {
//   const input = document.getElementById(
//     `${key.name}_checkbox`
//   ) as HTMLInputElement
//   input.checked = await Storage.getBoolean(key)
//   input.onchange = (e: HTMLInputEvent) => {
//     Storage.setBoolean(key, e.target.checked)
//   }
// }

// bindBoolean(STORAGE_KEY_TOP_MENU)
// bindBoolean(STORAGE_KEY_STYLE_PERMISSION)
// bindBoolean(STORAGE_KEY_SEARCH_SYLLABUS)
// bindBoolean(STORAGE_KEY_ASSIGNMENT_HISTORY)
// bindBoolean(STORAGE_KEY_SMARTPHONE)
// bindBoolean(STORAGE_KEY_KIKUZOU)
