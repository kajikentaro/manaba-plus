export {}

declare global {
  interface Element {
    /**
     * Append the element to a parent.
     * @param parent the parent to be appended to
     * @returns the element
     */
    joinIn(parent: Element): Element
  }
}

Object.defineProperty(Element.prototype, 'joinIn', {
  value: function (parent: Element) {
    const element: Element = this
    parent.appendChild(element)
    return element
  },
})
