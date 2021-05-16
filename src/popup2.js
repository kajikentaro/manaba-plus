'use strict';
import * as download from './methods/download-popup.js';
let status = 1;
//0 error
//1 waiting init
//2 downloading
//3 finish
document.addEventListener('DOMContentLoaded', ()=>{
  loading_disp();
  detect_contentscript_close();
  send_dl_start();
  set_stop_dl();
  set_tab_close();
  progress_disp_cs();
});
function set_tab_close(){
  window.addEventListener('beforeunload',()=>{
    download.send_finish_dl();
  });
}
function detect_contentscript_close(){
  var func = (tabId, removeInfo)=>{
    let manaba_tabid = parseInt((new URL(document.location)).searchParams.get('tabid'));
    if(tabId == manaba_tabid && status == 1){
      download.stop_dl();
      alert("manabaのタブが閉じられたため、中止されました")
    }
  }
  chrome.tabs.onRemoved.addListener(func);
}
function set_stop_dl(){
  document.getElementById('stop-dl').onclick = ()=>{
    if(status == 1){
      let manaba_tabid = parseInt((new URL(document.location)).searchParams.get('tabid'));
        chrome.tabs.sendMessage(
          manaba_tabid,
          { type: 'stopDL-trigger'},
        );
    }
    if(status != 3){
      download.stop_dl();
      status = 0;
    }
  }
}
let callback = (value)=>{
  console.log(value);
  if(value.permit == false){
    let message = document.getElementById('message');
    message.innerHTML = 'すでに他のタブでダウンロードされています。'
    status = 0;
  }else{
    if(status == 1){
      status = 2;
      download.download(value.dl_urls).then(()=>{
        status = 3;
      });
    }
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
  var dot_num = 0;
  initializing_dot();
  function initializing_dot(){
    let message = document.getElementById('message');
    let text = ['準備中','準備中 .','準備中 . .','準備中 . . .'];
    if(status == 1){
      dot_num++;
      message.innerHTML = text[dot_num % 4];
      setTimeout(initializing_dot, 500);
    }
  }
}
function progress_disp_cs(){
  let number_counter = document.getElementById('number-counter');
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type == 'initializing' && status == 1){
      number_counter.innerHTML = request.file_num + "のファイルを検出"
    }
    return true;
  });
}