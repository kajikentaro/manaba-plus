import { DOWNLOAD_LIST, STORAGE_KEY_ASSIGNMENT_HISTORY, ENABLE_INSERT_MP, STORAGE_KEY_KIKUZOU, STORAGE_KEY_SEARCH_SYLLABUS, STORAGE_KEY_SMARTPHONE, STORAGE_KEY_STYLE_PERMISSION, HIDDEN_ASSIGNMENTS } from "./module/const";
import { BooleanStorageKey, HTMLInputEvent } from "./module/type";
import * as Storage from "./module/storage";

document.getElementById("delete-download-history").addEventListener("click", () => {
  if (!confirm("よろしいですか？")) return;
  chrome.storage.local.set({ [DOWNLOAD_LIST]: [] }, () => {
    alert("完了");
  });
});
document.getElementById("reset-hidden-ass").addEventListener("click", () => {
  if (!confirm("よろしいですか？")) return;
  chrome.storage.sync.set({ [HIDDEN_ASSIGNMENTS]: [] }, () => {
    alert("完了");
  });
});
document.getElementById("contents-download").addEventListener("click", () => {
  window.open("download-progress.html");
});

const initToggleCheck = async () => {
  const enableInsertMp = await Storage.getBoolean(ENABLE_INSERT_MP);
  const input = document.querySelector<HTMLInputElement>("input#toggle-hide");
  input.checked = !enableInsertMp;
  input.onchange = (e: HTMLInputEvent) => Storage.setBoolean(ENABLE_INSERT_MP, !e.target.checked);
};

const bindBoolean = async (key: BooleanStorageKey) => {
  const input = document.getElementById(`${key.name}_checkbox`) as HTMLInputElement;
  input.checked = await Storage.getBoolean(key);
  input.onchange = (e: HTMLInputEvent) => {
    Storage.setBoolean(key, e.target.checked);
  }
}

initToggleCheck();

bindBoolean(STORAGE_KEY_STYLE_PERMISSION);
bindBoolean(STORAGE_KEY_SEARCH_SYLLABUS);
bindBoolean(STORAGE_KEY_ASSIGNMENT_HISTORY);
bindBoolean(STORAGE_KEY_SMARTPHONE);
bindBoolean(STORAGE_KEY_KIKUZOU);