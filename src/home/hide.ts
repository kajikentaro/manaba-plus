import getOptions from '../options/models'

export default async function () {
  const { options } = await getOptions()

  const items = [
    options.home['visibility-and-movement']['hide-or-move-alert'],
    options.home['visibility-and-movement']['hide-or-move-centernews'],
    options.home['visibility-and-movement']['hide-or-move-syllabus'],
    options.home['visibility-and-movement']['hide-or-move-assignment'],
    options.home['visibility-and-movement']['hide-or-move-former-link'],
    options.home['visibility-and-movement']['hide-or-move-kikuzou'],
    options.home['visibility-and-movement']['hide-or-move-banner-list'],
  ]
  for (const item of items) {
    if (item.value !== 'hide') {
      continue
    }

    const element = document.getElementById(item.id)
    if (element === null) {
      continue
    }

    element.shown(false)
  }
}
