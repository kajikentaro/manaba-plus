import '../extension/htmlElement'
import getHash from './get-hash'

/**
 * Remove removable elements.
 * @param removedCollectionItem The option collection item of ids
 * @param selectors Query selectors to get removable elements
 */
export default function (
  removedCollectionItem: OptionCollectionItem,
  selectors: string
) {
  const removedSet = new Set<string>(removedCollectionItem.value)

  document
    .querySelectorAll<HTMLElement>(selectors)
    .forEach(async function (element) {
      const hash = await getHash(element)
      if (hash === null) {
        return
      }

      if (!removedSet.has(hash)) {
        return
      }

      element.setAttribute('removed', '')
      element.shown(false)
    })
}
