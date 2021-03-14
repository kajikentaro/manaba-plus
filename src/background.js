'use strict';
// 現時点でのruleをクリア(removeRules)して
chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
  // 新たなruleを追加する
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [
      // アクションを実行する条件
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {urlEquals: 'https://room.chuo-u.ac.jp/ct/home'},
      })
    ],
    // 実行するアクション
    actions: [
      new chrome.declarativeContent.ShowPageAction()
    ]
  }]);
});