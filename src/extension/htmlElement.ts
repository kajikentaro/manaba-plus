Object.defineProperty(HTMLElement.prototype, 'isShown', {
  get(): boolean {
    return this.style.display !== 'none'
  },
  set(value: boolean) {
    if (value) {
      this.style.display = this._display
    } else {
      this._display = this.style.display
      this.style.display = 'none'
    }
  },
})
