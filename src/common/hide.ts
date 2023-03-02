import getOptions from '../options/models'
import hide from '../hide'

export default async function () {
  const options = await getOptions()

  if (!options.common['show-notes'].value) {
    hide('.memo, a[href="home_usermemo"]')
  }
}
