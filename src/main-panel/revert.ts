import '../extension/htmlElement'

/**
 * Revert removable elements.
 * @param selectors Query selectors to get removable elements
 */
export default function (selectors: string) {
  document
    .querySelectorAll<HTMLElement>(selectors)
    .forEach(async function (element) {
      element.shown(true)
    })
}
