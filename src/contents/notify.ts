import '../extension/htmlElement'

export const showCompletedMessage = function () {
  document.querySelector<HTMLElement>('#completed-message')?.shown(true)
}

export const showCanceledMessage = function () {
  document.querySelector<HTMLElement>('#canceled-message')?.shown(true)
}

export const hideMessages = function () {
  document
    .querySelectorAll<HTMLElement>('#completed-message, #canceled-message')
    .forEach((element) => element.shown(false))
}
