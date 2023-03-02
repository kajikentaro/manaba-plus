import './extension/htmlElement'

export default function (selectors: string) {
  document.querySelectorAll<HTMLElement>(selectors).forEach(function (element) {
    element.shown(false)
  })
}
