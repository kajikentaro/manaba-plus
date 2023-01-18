import {
  DOWNLOAD_LIST,
  HIDDEN_ASSIGNMENTS,
  STORAGE_KEY_ASSIGNMENT_HISTORY,
  STORAGE_KEY_KIKUZOU,
  STORAGE_KEY_SEARCH_SYLLABUS,
  STORAGE_KEY_SMARTPHONE,
  STORAGE_KEY_STYLE_PERMISSION,
  STORAGE_KEY_TOP_MENU,
} from "./module/const";
import * as Storage from "./module/storage";
import { BooleanStorageKey, HTMLInputEvent } from "./module/type";

/**
 * Manaba Plus オプション画面のボタン動作を定義するプログラム
 */
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

const bindBoolean = async (key: BooleanStorageKey) => {
  const input = document.getElementById(`${key.name}_checkbox`) as HTMLInputElement;
  input.checked = await Storage.getBoolean(key);
  input.onchange = (e: HTMLInputEvent) => {
    Storage.setBoolean(key, e.target.checked);
  };
};

bindBoolean(STORAGE_KEY_TOP_MENU);
bindBoolean(STORAGE_KEY_STYLE_PERMISSION);
bindBoolean(STORAGE_KEY_SEARCH_SYLLABUS);
bindBoolean(STORAGE_KEY_ASSIGNMENT_HISTORY);
bindBoolean(STORAGE_KEY_SMARTPHONE);
bindBoolean(STORAGE_KEY_KIKUZOU);
