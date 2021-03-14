'use strict';
import * as download from './methods/download-popup.js';
let dot_num = 0;
document.addEventListener('DOMContentLoaded', ()=>{
  detect_contentscript_close();
  send_dl_start();
  set_stop_dl();
  loading_disp();
  progress_disp_cs();
});
function detect_contentscript_close(){
  var func = (tabId, removeInfo)=>{
    let manaba_tabid = parseInt((new URL(document.location)).searchParams.get('tabid'));
    if(tabId == manaba_tabid){alert("manabaのタブが閉じられたため、中止されました")}
  }
  chrome.tabs.onRemoved.addListener(func);
}
function set_stop_dl(){
  document.getElementById('stop-dl').onclick = ()=>{
    download.stop_dl();
  }
}
let callback = (value)=>{
  console.log(value);
  dot_num = -1;
  if(value.permit == false){
    let message = document.getElementById('message');
    message.innerHTML = 'すでに他のタブでダウンロードされています。'
  }else{
    download.download(value.dl_urls);
  }
}
function send_dl_start(){
  let manaba_tabid = parseInt((new URL(document.location)).searchParams.get('tabid'));
  chrome.tabs.getCurrent((tab)=>{
    let this_tabid = tab.id;
    chrome.tabs.sendMessage(
      manaba_tabid,
      { type: 'startDL-trigger', progress_tabid: this_tabid},
      callback);
  });
}
function loading_disp(){
  initializing_dot();
  function initializing_dot(){
    let message = document.getElementById('message');
    let text = ['準備中','準備中 .','準備中 . .','準備中 . . .'];
    if(dot_num >= 0){
      dot_num++;
      message.innerHTML = text[dot_num % 4];
      setTimeout(initializing_dot, 500);
      console.log('hey');
    }
  }
}
function progress_disp_cs(){
  let number_counter = document.getElementById('number-counter');
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type == 'initializing'){
      number_counter.innerHTML = request.file_num + "のファイルを検出"
    }
    return true;
  });
}