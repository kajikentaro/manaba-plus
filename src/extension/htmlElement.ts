export {}

declare global {
  interface HTMLElement {
    /**
     * Indicates if the element is shown or hidden.
     * The style `display` of the element will be `none` if false.
     */
    isShown: boolean
  }
}

Object.defineProperty(HTMLElement.prototype, 'isShown', {
  get(): boolean {
    const element: HTMLElement = this
    return element.style.display !== 'none'
  },
  set(value: boolean) {
    const element: HTMLElement = this
    if (value) {
      element.style.display = ''
    } else {
      element.style.display = 'none'
    }
  },
})
