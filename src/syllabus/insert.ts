/**
 * Insert an anchor to the self-registration page.
 */
export default function () {
  // Extract the course code.
  const match = /(.+)syllabus_(\d+)/.exec(location.href)
  if (match === null) {
    return
  }

  const container = document.querySelector('.articlebody')

  const anchor = document.createElement('a')
  anchor.className = 'self-registration'
  anchor.href = `${match[1]}home_selfregistration_${match[2]}`
  container.insertAdjacentElement('afterbegin', anchor)
}
