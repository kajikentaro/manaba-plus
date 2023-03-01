export {}

declare global {
  interface HTMLElement {
    /**
     * Return true if the element is shown, or false if hidden, when called with no params.
     * Give a value as a param to set it.
     * The style `display` of the element will be `none` if false.
     */
    shown: (value?: boolean) => boolean | void
  }
}

Object.defineProperty(HTMLElement.prototype, 'shown', {
  value: function (value?: boolean) {
    const element: HTMLElement = this
    if (typeof value === 'undefined') {
      return element.style.display !== 'none'
    } else {
      if (value) {
        element.style.display = ''
      } else {
        element.style.display = 'none'
      }
    }
  },
})
