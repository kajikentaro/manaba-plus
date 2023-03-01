import consts from './consts.json'

// Replace string items with their own keys.
const groupStack = [consts]
while (groupStack.length) {
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

console.log(consts)
export default consts
