/* content-dl.ts */
export const URL_HOME = "https://room.chuo-u.ac.jp/ct/home";
export const STOP_MESSAGE_ON_DL = "ファイルダウンロードが中止されました。";
export const STOP_MESSAGE_ON_INIT = "ダウンロードが中止されました。";
export const STOP_MESSAGE_ON_DL_CONFIRM = "ダウンロードが中断されました。";
export class MPError extends Error {
  MP_IDENTIFY = true;
}

/* chrome.storage key */
export const DOWNLOAD_LIST = "download_list";
export const ENABLE_INSERT_MP = "enable_insert_mp";
export const HIDED_ASSIGNHMENT = "hided_assignment";

/* home.ts */
export const DELETABLE_ROW = "deletable-row";

/* convenient tools */
export const getLocalDateStr = () => {
  return new Date().toLocaleString("ja", { timeZone: "Asia/Tokyo" });
};
export const MAX_TIMESTAMP = 8640000000000000;
export const InfinityDate = new Date(MAX_TIMESTAMP);
