// import * as Storage from "../module/storage"

// export default async () => {
//     const stylePermission = await Storage.getBoolean(STORAGE_KEY_STYLE_PERMISSION)
//     if (stylePermission !== true) {
//       return
//     }
  
//     const contentbodyLeft = document.getElementsByClassName(
//       "contentbody-left"
//     )[0] as HTMLElement
//     contentbodyLeft.style.width = "671px"
//     contentbodyLeft.style.paddingRight = "15px"
  
//     const courselistweekly = document.getElementById("courselistweekly")
//     if (courselistweekly !== null) {
//       courselistweekly.style.paddingRight = "0px"
//     }
//     const infolistHeaders = document.getElementsByClassName(
//       "my-infolist-header"
//     ) as HTMLCollectionOf<HTMLElement>
//     Array.from(infolistHeaders).forEach((element) => {
//       element.style.backgroundSize = "100% 100%"
//     })
  
//     const tableHeaders = document.querySelectorAll<HTMLElement>(".courselist th")
//     tableHeaders[0].setAttribute("width", "auto")
//     tableHeaders[1].setAttribute("width", "50px")
//     tableHeaders[2].setAttribute("width", "50px")
//     tableHeaders[3].setAttribute("width", "20%")
// }