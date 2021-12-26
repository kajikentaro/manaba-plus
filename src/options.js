import {DOWNLOAD_LIST, ENABLE_INSERT_MP, HIDED_ASSIGNHMENT} from "./const";

document.getElementById("delete-download-history").addEventListener("click", () => {
  chrome.storage.local.set({[DOWNLOAD_LIST]: [] }, () => {
    alert("完了")
  });
});
document.getElementById("reset-hidden-ass").addEventListener("click", () => {
  chrome.storage.sync.set({ [HIDED_ASSIGNHMENT]: [] }, () => {
    alert("完了")
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
	return res;
}
const initToggleCheck = async () => {
	const enableInsertMp = await isEnableInsertMp()
  document.getElementById("toggle-hide").checked = !enableInsertMp;
  document.getElementById("toggle-hide").onchange = (v) => {
    console.log(v.target.checked);
    if (v.target.checked) {
      chrome.storage.local.set({ [ENABLE_INSERT_MP]: false });
    } else {
      chrome.storage.local.set({ [ENABLE_INSERT_MP]: true});
    }
  }
}
initToggleCheck();