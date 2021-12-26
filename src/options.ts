import { DOWNLOAD_LIST, ENABLE_INSERT_MP, HIDED_ASSIGNHMENT } from "./module/const";
import { HTMLInputEvent } from "./module/type";

document.getElementById("delete-download-history").addEventListener("click", () => {
  chrome.storage.local.set({ [DOWNLOAD_LIST]: [] }, () => {
    alert("完了");
  });
});
document.getElementById("reset-hidden-ass").addEventListener("click", () => {
  chrome.storage.sync.set({ [HIDED_ASSIGNHMENT]: [] }, () => {
    alert("完了");
  });
});
document.getElementById("contents-download").addEventListener("click", () => {
  window.open("download-progress.html");
});
const isEnableInsertMp = async () => {
  const res = await new Promise((resolve) => {
    chrome.storage.local.get([ENABLE_INSERT_MP], function (result) {
      if (result[ENABLE_INSERT_MP] === undefined) resolve(true);
      resolve(result[ENABLE_INSERT_MP]);
    });
  });
  return res as boolean;
};
const initToggleCheck = async () => {
  const enableInsertMp = await isEnableInsertMp();
  document.querySelector<HTMLInputElement>("input#toggle-hide").checked = !enableInsertMp;
  document.querySelector<HTMLInputElement>("input#toggle-hide").onchange = (v: HTMLInputEvent) => {
    console.log(v.target.checked);
    if (v.target.checked) {
      chrome.storage.local.set({ [ENABLE_INSERT_MP]: false });
    } else {
      chrome.storage.local.set({ [ENABLE_INSERT_MP]: true });
    }
  };
};
initToggleCheck();
