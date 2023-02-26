// import { DELETABLE_ROW, HIDDEN_ASSIGNMENTS } from './const'

// /**
//  * 課題の表示を管理するクラス
//  */
// export default class AssignmentViewer {
//   private allAss: Assignment[]
//   private courseURLs: string[]

//   private sortIsReverse = false
//   private showDisable = false
//   private showExtraAss = false
//   private sortBase = 'deadline'

//   constructor(allAss: Assignment[], hidedAss: string[], courseURLs: string[]) {
//     for (const a of allAss) {
//       if (hidedAss.includes(a.href)) {
//         a.disable = true
//       } else {
//         a.disable = false
//       }
//     }
//     this.allAss = allAss
//     this.courseURLs = courseURLs
//   }

//   inputClick = () => {
//     // update disable or enable setting of assignments
//     const disableHref = []
//     for (const row of this.allAss) {
//       if (row.disable === true) {
//         disableHref.push(row.href)
//       }
//     }
//     chrome.storage.sync.set(
//       { [HIDDEN_ASSIGNMENTS]: disableHref },
//       function () {}
//     )
//     this.repaint()
//   }

//   showExtraAssIs(active: boolean) {
//     this.showExtraAss = active
//   }

//   showDisableAssIs(active: boolean) {
//     this.showDisable = active
//   }

//   repaint() {
//     this.clearTable()
//     this.insertLabel()
//     const enableRows = this.filterAndSort()
//     this.insertRows(enableRows)
//   }

//   insertRows(ass: Assignment[]) {
//     const addParent = document.getElementById('mp-table')
//     if (ass.length === 0) {
//       const noAssMessage = document.createElement('tr')
//       noAssMessage.classList.add(DELETABLE_ROW)
//       noAssMessage.classList.add('no-assignment-message')
//       noAssMessage.innerHTML = 'ないヨ。 _(:3 」∠ )_ '
//       noAssMessage.setAttribute('asspan', '5')
//       addParent.appendChild(noAssMessage)
//     } else {
//       for (const a of ass) {
//         addParent.appendChild(a.getTd())
//       }
//     }
//   }

//   filterAndSort() {
//     const enableRow = [] as Assignment[]
//     for (const row of this.allAss) {
//       if (this.showDisable === false) {
//         // フィルターがオンの場合
//         if (row.disable === true) continue // 非表示なら表示しない
//       }
//       if (this.showExtraAss === false) {
//         // extraを表示しない場合
//         let skip = true
//         for (const courseURL of this.courseURLs) {
//           // row.hrefに全てのcourseURLが含まれなければスキップ
//           if (row.href.indexOf(courseURL) !== -1) skip = false
//         }
//         if (skip) continue
//       }
//       enableRow.push(row)
//     }
//     // ソート
//     enableRow.sort((a: Assignment, b: Assignment) => {
//       let cmpRes: number
//       if (a[this.sortBase] >= b[this.sortBase]) {
//         cmpRes = 1
//       } else {
//         cmpRes = -1
//       }
//       if (this.sortIsReverse) cmpRes *= -1
//       return cmpRes
//     })
//     return enableRow
//   }

//   clearTable() {
//     const removeRows = document.getElementsByClassName(DELETABLE_ROW)
//     while (removeRows.length) {
//       removeRows[0].remove()
//     }
//   }

//   insertLabel() {
//     const tr = document.createElement('tr')
//     tr.classList.add('table-header')
//     tr.classList.add(DELETABLE_ROW)

//     const classes = ['course', 'ass', null, null, null]
//     const sortBases = ['courseName', 'assignmentName', null, 'deadline']
//     const texts = ['コース', '題名', '非表示', '受付終了']
//     for (let i = 0; i < 4; i++) {
//       const th = document.createElement('th')
//       tr.appendChild(th)
//       if (sortBases[i] === this.sortBase) {
//         // ここを基準にソートした場合
//         th.classList.add('sort-active')
//         th.innerHTML = this.sortIsReverse ? texts[i] + '▼' : texts[i] + '▲'
//       } else if (sortBases[i]) {
//         // それ以外の場合
//         th.innerHTML = texts[i] + ' '
//       } else {
//         // inputの場合
//         th.innerHTML = texts[i]
//       }
//       if (!sortBases[i]) continue
//       if (classes[i]) th.classList.add(classes[i])
//       th.classList.add('sort-label')
//       th.onclick = () => {
//         if (this.sortBase === sortBases[i])
//           this.sortIsReverse = !this.sortIsReverse
//         else this.sortIsReverse = false
//         this.sortBase = sortBases[i]
//         this.repaint()
//       }
//     }
//     const addParent = document.getElementById('mp-table')
//     addParent.appendChild(tr)
//   }
// }
