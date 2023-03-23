import constants from './constants.json'

// Replace string items with their own keys.
const groupStack = [constants]
while (groupStack.length > 0) {
  const group = groupStack.pop()
  for (const key in group) {
    const item = group[key]

    if (typeof item === 'string') {
      if (item === '') {
        group[key] = key
      }
    } else {
      groupStack.push(item)
    }
  }
}

export default constants
