'use strict';
var path_module = require('path');
/*
chrome.tabs.onUpdated.addListener((tabId) => {
  chrome.pageAction.show(tabId);
});*/
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
/*
chrome.tabs.onUpdated.addListener((tabId) => {
  chrome.pageAction.show(tabId);
});
*/
let downloading_num;
let download_list_new = [];
let download_list_old;
function startDL(){
	if(downloading_num == download_list_new.length){
		return true;
	}
	let d_info = download_list_new[downloading_num];
	let url = d_info.url;
	let filename_ex = decodeURI(url.match(".+/(.+?)([\?#;].*)?$")[1]);
	let path = path_module.join('Manaba', d_info.course, d_info.content, filename_ex);
	path = path.replace(/\s+/g, "");
	chrome.downloads.download({ url: d_info.url, filename: path }, (downloadID) => {
		chrome.runtime.sendMessage({ type: 'progress_start', page: d_info.page });
	});
}
chrome.downloads.onChanged.addListener((downloadDelta) => {
  if (downloadDelta.state){
	  if(downloadDelta.state.current == 'interrupted'){
	  }
	  if(downloadDelta.state.current == 'complete'){
		  download_list_old.push(download_list_new[downloading_num]);
		  chrome.storage.local.set({ 'download_list': download_list_old }, () => { console.log('complete') });
	  }
	  chrome.runtime.sendMessage({ type: 'progress_finish', status:downloadDelta.state.current});
	  downloading_num++;
	  startDL();
  }
});
function initializeDL(request){
	download_list_new = [];
	let download_list_now = request.download_list;
	for (let i = 0; i < download_list_now.length; i++) {
		let isNew = true;
		for (let j = 0; j < download_list_old.length; j++) {
			if (download_list_now[i].url == download_list_old[j].url) isNew = false;
		}
		if (isNew) {
			download_list_new.push(download_list_now[i]);
		}
	}
	let downloading_page = '完了。新規ファイルはありませんでした。'
	let already_done = true;
	if (download_list_new.length) {
		downloading_page = download_list_new[0].page;
		already_done = false;
	}
	chrome.runtime.sendMessage({ type: 'initialize_done', download_num: download_list_new.length, page: downloading_page, already_done: already_done });
	downloading_num = 0;
	startDL();
}
let request_backup;
function getOldList(request){
	request_backup = request;
	chrome.storage.local.get('download_list', (value) => {
		if(!value || Object.keys(value).length == 0){
			download_list_old = [];
		}else{
			download_list_old = value.download_list;
		}
		console.log(download_list_old);
		initializeDL(request_backup);
	});
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'startDL-32') {
		getOldList(request);
		return true;
	}
});