document.getElementById('delete-download-history').addEventListener('click', () => {
  chrome.storage.local.set({ 'download_list': [] }, () => {
    alert('完了')
  });
});
document.getElementById('reset-hidden-ass').addEventListener('click', () => {
  chrome.storage.sync.set({ 'hided_assignment': [] }, () => {
    alert('完了')
  });
});
document.getElementById('contents-download').addEventListener('click', () => {
  window.open('download-progress.html');
});
const is_enable_insert_mp = async () => {
	const res = await new Promise((resolve) => {
		chrome.storage.local.get(["enable_insert_mp"], function (result) {
			if (result.enable_insert_mp === undefined) resolve(true);
			resolve(result.enable_insert_mp);
		});
	});
	return res;
}
const init_toggle_check = async () => {
	const enable_insert_mp = await is_enable_insert_mp()
  document.getElementById("toggle-hide").checked = !enable_insert_mp;
  document.getElementById("toggle-hide").onchange = (v) => {
    console.log(v.target.checked);
    if (v.target.checked) {
      chrome.storage.local.set({ enable_insert_mp: false });
    } else {
      chrome.storage.local.set({ enable_insert_mp: true});
    }
  }
}
init_toggle_check();