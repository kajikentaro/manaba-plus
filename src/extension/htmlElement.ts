export {}

declare global {
  interface HTMLElement {
    /**
     *
     * Give a value as a param to set it.
     * The style `display` of the element will be `none` if false.
     */
    /**
     * Get whether the element is shown or hidden with no params, or set the value.
     * @param value the value to be set to
     * @returns true if the element style `display` is not `none`, otherwise false or the element when `value` is undefined
     */
    shown: (value?: boolean) => boolean | HTMLElement
  }
}

Object.defineProperty(HTMLElement.prototype, 'shown', {
  configurable: true,
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
      return element
    }
  },
})
