// Entry point
export default function () {
  const id = 'AFFirstInput'
  const pastInput = document.getElementById(id)
  if (pastInput === null) {
    return
  }

  const input = document.createElement('input')
  input.id = id
  input.type = 'file'
  input.multiple = true
  input.style.display = 'none'

  pastInput.replaceWith(input)
}
