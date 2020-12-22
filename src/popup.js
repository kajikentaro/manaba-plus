'use strict';

import './popup.css';
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('clear-cache').addEventListener('click', () => {
    chrome.storage.local.set({'download_list': []}, ()=>{console.log('complete')});
    alert('完了')
  });
  document.getElementById('startDL').addEventListener('click', () => {
    let aim_message = (tabs) => {
      window.open('popup2.html?tabid='+tabs[0].id);
    }
    chrome.tabs.query({ active: true, currentWindow: true }, aim_message);
  });
});