import consts from './consts.json'

// Replace string items with their own keys.
const groupQueue = [consts]
while (groupQueue.length) {
  const group = groupQueue.pop()
  for (const key in group) {
    const item = group[key]

    if (typeof item === 'string') {
      group[key] = key
    } else {
      groupQueue.push(item)
    }
  }
}

export default consts
