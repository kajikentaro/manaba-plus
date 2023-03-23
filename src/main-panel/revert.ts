import '../extension/htmlElement'

export default function (selectors: string) {
  document
    .querySelectorAll<HTMLElement>(selectors)
    .forEach(async function (element) {
      element.shown(true)
    })
}
