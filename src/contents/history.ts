const storageKey = 'contents-history'

let history: Set<string> = null

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

export const setHistory = async function (newHistory: Set<string>) {
  history = newHistory

  await chrome.storage.local.set({ [storageKey]: [...history] })
}

export const clearHistory = async function () {
  await chrome.storage.local.remove(storageKey)
}
