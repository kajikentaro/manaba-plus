"use strict"

import { throws } from 'assert';

var path_module = require('path');
var permit_dl = true;
export async function download(raw_urls){
	var stored_urls = await get_stored_urls();
	var pure_urls = filter_urls(raw_urls, stored_urls);
	if(pure_urls.length == 0){
		progress_disp('完了。新規ファイルはありませんでした。');
		send_finish_dl();
		return;
	}else{
		progress_disp('ダウンロードを開始します。','0/' + pure_urls.length);
		await download_files(pure_urls, stored_urls);
		progress_disp('ダウンロードが完了しました。', null, 100);
		send_finish_dl();
		return;
	}
}
export function stop_dl(){
	progress_disp('ダウンロードの中止. . .')
	chrome.downloads.cancel(id,()=>{
		progress_disp('ダウンロードが中止されました。')
	});
	permit_dl = false;
}
function send_finish_dl(){
	let manaba_tabid = parseInt((new URL(document.location)).searchParams.get('tabid'));
	chrome.tabs.getCurrent((tab)=>{
	chrome.tabs.sendMessage(
		manaba_tabid,
		{ type: 'finishDL-trigger'}
	)});
}
let id = -1;
async function download_files(urls, stored_urls){
	var resolve_hold;
	var reject_hold;
	chrome.downloads.onChanged.addListener((downloadDelta) => {
		if (id != downloadDelta.id)return;
		if (downloadDelta.state) {
			if (downloadDelta.state.current == 'interrupted')reject_hold();
			if (downloadDelta.state.current == 'complete')resolve_hold();
		}
	});
	for(var i=0;i<urls.length;i++){
		if(permit_dl == false)throw new Error('ユーザーによるダウンロード中止');
		var url = urls[i];
		progress_disp(url.course+ ' ' + url.page + 'をダウンロード中',  (i+1) + "/" + urls.length, (i+1) / urls.length * 100);
		await download_file(url).then(()=>{
			stored_urls.push(url);
			chrome.storage.local.set({ 'download_list': stored_urls}, () => { console.log('store url') });
		});
	}
	async function download_file(url){
		let filename_ex = decodeURI(url.url.match(".+/(.+?)([\?#;].*)?$")[1]);
		let path = path_module.join('Manaba', url.course, url.content, filename_ex);
		path = path.replace(/\s+/g, "");
		chrome.downloads.download({ url: url.url, filename: path }, (downloadID) => {
			id = downloadID;
		});
		return new Promise((resolve, reject) =>{
			resolve_hold = resolve;
			reject_hold = reject;
		});
	}
	return;
}
function get_stored_urls(){
	return  new Promise(resolve =>{
		chrome.storage.local.get('download_list', (value) => {
			var result = [];
			if(value && Object.keys(value).length != 0){
				result = value.download_list;
			}
			resolve(result);
		});
	})
}
function filter_urls(raw_urls, stored_urls){
	var pure_urls = [];
	for(var raw_url of raw_urls){
		var is_new = true;
		for(var stored_url of stored_urls){
			if(raw_url.url == stored_url.url)is_new = false;
		}
		if(is_new)pure_urls.push(raw_url);
	}
	return pure_urls;
}
function progress_disp(message = null, rate = null, progress_n = null){
	if(message) document.getElementById('message').innerHTML = message;
	if(rate) document.getElementById('number-counter').innerHTML = rate;
	if(progress_n) document.getElementById('progress').value = progress_n;
}