document.getElementById('delete-download-history').addEventListener('click', () => {
  chrome.storage.local.set({ 'download_list': [] }, () => {
    alert('完了')
  });
});
document.getElementById('reset-hidden-ass').addEventListener('click', () => {
  chrome.storage.local.set({ 'hided_assignment': [] }, () => {
    alert('完了')
  });
});
document.getElementById('contents-download').addEventListener('click', () => {
  window.open('download-progress.html');
});