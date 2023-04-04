/**
 * Set data to local storage with a specific key.
 * @param key The key to identifying the data
 * @param obj The data to be stored
 */
export const set = async function <T>(key: string, obj: T) {
  await chrome.storage.local.set({ [key]: obj })
}

/**
 * Get data from local storage with a specific key.
 * @param key The key to identifying the data
 * @param obj The default value returned when the data is not stored
 * @returns The data if it is stored, otherwise `obj`
 */
export const get = async function <T>(key: string, obj: T = null) {
  const pairs = await chrome.storage.local.get({ [key]: obj })
  return pairs[key] as T
}
