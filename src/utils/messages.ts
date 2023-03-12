import _messages from './messages.json'
export const messages = _messages

const storageKey = 'messages'

export const popMessages = async function () {
  const pairs = await chrome.storage.local.get({ [storageKey]: [] })
  await chrome.storage.local.remove(storageKey)
  return Array.from<string>(pairs[storageKey])
}

export const pushMessages = async function (...messages: string[]) {
  const currentMessages = await popMessages()
  await chrome.storage.local.set({
    [storageKey]: currentMessages.concat(messages),
  })
}
