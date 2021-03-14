'use strict';
import './popup.css';
let dot_num = 0;
document.addEventListener('DOMContentLoaded', ()=>{
  send_dl_start();
  loading_disp();
  progress_disp();
});

function send_dl_start(){
  let manaba_tabid = parseInt((new URL(document.location)).searchParams.get('tabid'));
  let callback = (value)=>{
    if(value == false){
      let message = document.getElementById('message');
      message.innerHTML = 'すでに他のタブでダウンロードされています。'
    }
  }
  chrome.tabs.getCurrent((tab)=>{
    let this_tabid = tab.id;
    console.log(this_tabid);
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
function progress_disp(){
  let download_num;
  let downloaded_num = 0;
  let progress_bar = document.getElementById('progress');
  let message = document.getElementById('message');
  let number_counter = document.getElementById('number-counter');
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type == 'initializing'){
      number_counter.innerHTML = request.file_num + "のファイルを検出"
    }
    if (request.type == 'initialize_done'){
      dot_num = -1;
      message.innerHTML = request.page;
      download_num = request.download_num;
      number_counter.innerHTML = '0' + '/' + download_num;
      if(request.already_done)progress_bar.value = 100;
    }
    if (request.type == 'progress_start'){
      message.innerHTML = '"' + request.page + '"をダウンロード中';
    }
    if (request.type == 'progress_finish'){
      downloaded_num++;
      if(download_num == downloaded_num){
        message.innerHTML = '完了しました。'
      }
      number_counter.innerHTML = downloaded_num + '/' + download_num;
      progress_bar.value = Math.floor((downloaded_num * 100 + download_num - 1) / download_num);
    }
    return true;
  });
}