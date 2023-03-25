import { messages, pushMessages } from '../utils/messages'

const storageKey = 'version'

/**
 * Get the current version from the manifest.
 * @returns The current version string
 */
const getCurrentVersion = function () {
  const manifest = chrome.runtime.getManifest()
  const version = manifest.version
  const match = /(\d+?.\d+?).\d+?/.exec(version)
  return match[1]
}

/**
 * Set a new version to the storage and get the previous value.
 * @param version The new version string set to the storage
 * @returns The last version string from the storage
 */
const setLastVersion = async function (version: string) {
  const pairs = await chrome.storage.sync.get({ [storageKey]: null })
  const lastVersion = pairs[storageKey] as string

  await chrome.storage.sync.set({ [storageKey]: version })
  return lastVersion
}

/**
 * Push a message to notify updates.
 */
export default async function () {
  const currentVersion = getCurrentVersion()
  const lastVersion = await setLastVersion(currentVersion)
  if (lastVersion === null) {
    return
  }

  if (currentVersion !== lastVersion) {
    await pushMessages(messages.version.replace('$version$', currentVersion))
  }
}
