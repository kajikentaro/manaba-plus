import getOptions from '../options/models'
import hide from '../hide'

export default async function () {
  const options = await getOptions()

  if (!options.home['show-alert'].value) {
    hide('.alertlist')
  }

  const showSyllabus = options.home['show-syllabus'].value
  const showAssignment = options.home['show-assignment'].value
  const showFormerLink = options.home['show-former-link'].value
  const showKikuzou = options.home['show-kikuzou'].value

  if (!showSyllabus) {
    hide('.my-infolist-searchall')
  }

  if (!showAssignment) {
    hide('.my-infolist-event')
  }

  if (!showFormerLink) {
    hide('.my-infolist-tips:not(.my-infolist-kikuzou)')
  }

  if (!showKikuzou) {
    hide('.my-infolist-kikuzou')
  }
}
