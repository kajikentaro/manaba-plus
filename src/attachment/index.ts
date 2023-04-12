/*
form = document.querySelector('form:has(.report-form)')

input = document.querySelector('input[type=file]')
input.removeAttribute('onchange')
input.style.display = ''

  form.addEventListener('dragover', function () {
    event.preventDefault()
  })
  form.addEventListener('drop', function (event) {
    event.preventDefault()
    input.files = event.dataTransfer.files
    
    console.log(input.files)
  })
*/

/*
hidden = document.querySelector('[name="action_ReportStudent_submitdone"]')
hidden.value = 1
hidden.removeAttribute('type')
form.submit()
*/

/**
 * ドラックアンドドロップでレポートを提出するプログラム
 */
const form = document.querySelector('.report-form').parentElement
  .parentElement as HTMLFormElement
const input = document.querySelector<HTMLInputElement>('input[type=file]')
if (input) {
  insertDropMessage()
  addListener()
}

function submit() {
  const hidden = document.createElement('input')
  hidden.type = 'hidden'
  hidden.name = 'action_ReportStudent_submitdone'
  hidden.value = '1'
  // manaba.disable_submit_button(form);
  form.appendChild(hidden)
  form.submit()
}

function insertDropMessage() {
  const mess = document.createElement('div')
  mess.setAttribute('id', 'drop-state')
  mess.innerHTML = '<p>またはここにファイルをドロップ</p>'
  input.parentElement.parentElement.appendChild(mess)
}

function addListener() {
  form.addEventListener('dragover', function () {
    event.preventDefault()
    form.parentElement.style.backgroundColor = '#d7e2fc'
  })
  form.addEventListener('dragleave', function () {
    form.parentElement.style.backgroundColor = ''
  })
  form.addEventListener('drop', function (event) {
    event.preventDefault()
    input.files = event.dataTransfer.files
    submit()
  })
}
