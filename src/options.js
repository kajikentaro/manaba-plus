document.getElementById("delete-download-history").addEventListener("click", () => {
  chrome.storage.local.set({ "downloadList": [] }, () => {
    alert("完了")
  });
});
document.getElementById("reset-hidden-ass").addEventListener("click", () => {
  chrome.storage.sync.set({ "hidedAssignment": [] }, () => {
    alert("完了")
  });
});
document.getElementById("contents-download").addEventListener("click", () => {
  window.open("download-progress.html");
});
const isEnableInsertMp = async () => {
	const res = await new Promise((resolve) => {
		chrome.storage.local.get(["enable_insert_mp"], function (result) {
			if (result.enableInsertMp === undefined) resolve(true);
			resolve(result.enableInsertMp);
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
      chrome.storage.local.set({ enable_insert_mp: false });
    } else {
      chrome.storage.local.set({ enable_insert_mp: true});
    }
  }
}
initToggleCheck();