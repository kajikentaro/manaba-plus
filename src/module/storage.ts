import { BooleanStorageKey } from "./type";

// ストレージからboolean値を取得する。
export const getBoolean = async (key: BooleanStorageKey): Promise<boolean> => new Promise(resolve => {
  chrome.storage.sync.get([key.name], items => {
    const item = items[key.name];
    if (item === undefined) {
      resolve(key.defaultValue);
    }
    else {
      resolve(item);
    }
  });
});

// ストレージにboolean値を設定する。
export const setBoolean = async (key: BooleanStorageKey, value: boolean) => new Promise(resolve => {
  chrome.storage.sync.set({ [key.name]: value });
});