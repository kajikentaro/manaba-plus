import _messages from './messages.json'
export const messages = _messages

const storageKey = 'messages'

/**
 * Pop messages from the storage.
 * @returns The messages
 */
export const popMessages = async function () {
  const pairs = await chrome.storage.local.get({ [storageKey]: [] })
  await chrome.storage.local.remove(storageKey)
  return new Set<string>(pairs[storageKey])
}

/**
 * Push messages to the storage.
 * @param messages The messages
 */
export const pushMessages = async function (...messages: string[]) {
  const messageSet = await popMessages()

  for (const message of messages) {
    messageSet.add(message)
  }

  await chrome.storage.local.set({
    [storageKey]: Array.from(messageSet),
  })
}
