const form = document.querySelector<HTMLFormElement>('form:has(.report-form)')

/**
 * Upload a file.
 * @param file The file to be submitted
 * @returns The promise object to wait
 */
const submit = async function (file: File) {
  // return new Promise<void>(function (resolve) {
  // const win = window.open(location.href)

  // win.addEventListener('DOMContentLoaded', function () {
  //   // Set a file to an input element.
  //   const input = win.document.querySelector<HTMLInputElement>('[name="RptSubmitFile"]')
  //   const data = new DataTransfer()
  //   data.items.add(file)
  //   input.files = data.files

  //   // Set a flag.
  //   const hidden = win.document.querySelector<HTMLInputElement>('[name="action_ReportStudent_submitdone"]')
  //   hidden.value = '1'
  //   hidden.removeAttribute('type')

  //   const form = win.document.querySelector<HTMLFormElement>('form:has(.report-form)')
  //   form.submit()

  //   console.log('submit!!', new Date())

  //   win.addEventListener('beforeunload', function () {
  //     console.log('close!!', new Date())

  //     // win.close()
  //     // resolve()
  //   })
  // })

  if (form === null) {
    return false
  }

  const formData = new FormData(form)
  formData.set('RptSubmitFile', file)
  formData.set('action_ReportStudent_submitdone', '1')

  const response = await fetch('', {
    method: 'POST',
    body: formData,
  })

  return response.ok
  // })
}

const submitAll = async function (files: FileList) {
  const promises: Promise<boolean>[] = []

  for (const file of files) {
    promises.push(submit(file))
  }

  await Promise.all(promises)

  location.reload()
}

// Entry point
export default function () {
  if (form === null) {
    return
  }

  form.addEventListener('dragover', function (event) {
    event.preventDefault()
    form.setAttribute('dragging', '')
  })
  form.addEventListener('dragleave', function (event) {
    event.preventDefault()
    form.removeAttribute('dragging')
  })
  form.addEventListener('drop', async function (event) {
    event.preventDefault()
    submitAll(event.dataTransfer.files)
  })

  document
    .querySelector('#AFFirstInput')
    ?.addEventListener('change', async function (event) {
      event.preventDefault()
      const input = event.target as HTMLInputElement
      submitAll(input.files)
    })
}
