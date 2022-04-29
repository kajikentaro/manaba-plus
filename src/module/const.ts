import { BooleanStorageKey } from "./type";

/* content-dl.ts */
export const URL_HOME = "https://room.chuo-u.ac.jp/ct/home";
export const STOP_MESSAGE_ON_DL = "ファイルダウンロードが中止されました。";
export const STOP_MESSAGE_ON_INIT = "ダウンロードが中止されました。";
export const STOP_MESSAGE_ON_DL_CONFIRM = "ダウンロードが中断されました。";
export class MPError extends Error {
  MP_IDENTIFY = true;
}

/* chrome.storage key */
export const DOWNLOAD_LIST = "download_list"; // すでにダウンロードされたファイルのリスト
export const HIDDEN_ASSIGNMENTS = "hidden_assignments"; // 非表示にされた課題
export const ENABLE_INSERT_MP: BooleanStorageKey = { name: "enable_insert_mp", defaultValue: true }; // Manaba Plusが有効かどうか（隠されていないかどうか）
export const STORAGE_KEY_STYLE_PERMISSION: BooleanStorageKey = { name: "style_permission", defaultValue: true }; // スタイルの変更を許可するかどうか
export const STORAGE_KEY_SEARCH_SYLLABUS: BooleanStorageKey = { name: "search_syllabus", defaultValue: true }; // 「シラバス検索」を非表示にするかどうか
export const STORAGE_KEY_ASSIGNMENT_HISTORY: BooleanStorageKey = { name: "assignment_history", defaultValue: true }; // 未提出課題一覧と課題提出記録を非表示にするかどうか
export const STORAGE_KEY_SMARTPHONE: BooleanStorageKey = { name: "smartphone", defaultValue: true }; // 「旧スマートフォン版について」を非表示にするかどうか
export const STORAGE_KEY_KIKUZOU: BooleanStorageKey = { name: "kikuzou", defaultValue: true }; // 朝日新聞の広告を非表示にするかどうか

/* home.ts */
export const DELETABLE_ROW = "deletable-row";

/* convenient tools */
export const getLocalDateStr = () => {
  return new Date().toLocaleString("ja", { timeZone: "Asia/Tokyo" });
};
export const MAX_TIMESTAMP = 8640000000000000;
export const InfinityDate = new Date(MAX_TIMESTAMP);
