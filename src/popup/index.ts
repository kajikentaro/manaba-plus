/**
 * 拡張機能アイコンをクリックした時の動作を定義するプログラム
 */
chrome.action.onClicked.addListener(function () {
  chrome.runtime.openOptionsPage()
})
