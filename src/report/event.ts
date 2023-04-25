// const form = document.querySelector<HTMLFormElement>('form:has(.report-form)')
const form = document.querySelector<HTMLFormElement>('.form form')

/**
 * Upload a file.
 * @param file The file to be submitted
 * @returns True if the submission was succeeded, otherwise false
 */
const submit = async function (file: File) {
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
}

/**
 * Upload files.
 * @param files The file list to be submitted
 */
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
