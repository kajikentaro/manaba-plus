/**
 * Toggle the div elements' visibility and switch the message.
 * @param id The id of the element
 */
export default function (id: string) {
  document.querySelectorAll('#message div').forEach(function (element) {
    element.setAttribute('hidden', '')
  })

  document.getElementById(id).removeAttribute('hidden')
}
