const storageKey = 'contents-history'

let history: Set<string> = null

/**
 * Get a set of history strings from the storage.
 * @returns The set of history strings
 */
export const getHistory = async function () {
  if (history === null) {
    const pairs = await chrome.storage.local.get(storageKey)

    if (typeof pairs[storageKey] === 'undefined') {
      history = new Set()
    } else {
      history = new Set(pairs[storageKey])
    }
  }

  return history
}

/**
 * Set a new set of history strings to the storage.
 * @param newHistory The new set of history strings
 */
export const setHistory = async function (newHistory: Set<string>) {
  history = newHistory

  await chrome.storage.local.set({ [storageKey]: [...history] })
}

/**
 * Remove data from the storage.
 */
export const clearHistory = async function () {
  await chrome.storage.local.remove(storageKey)
}
