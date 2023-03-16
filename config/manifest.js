const glob = require('glob')
const path = require('path')

const valueLists = []

glob('hosts/*.json').then(function (hostFiles) {
  const pairs = new Map()

  for (const hostFile of hostFiles) {
    const hostFilepath = path.resolve(hostFile)
    const properties = require(hostFilepath)

    for (const key in properties) {
      const valueList = pairs.get(key) ?? []
      const value = properties[key]

      if (typeof value === 'string') {
        valueList.push(value)
      } else {
        valueList.push(...value)
      }

      pairs.set(key, valueList)
    }
  }

  const chars = /(?:[^"]|\\["])/.source

  for (const [key, valueList] of pairs) {
    const regex = new RegExp(
      `(\\s*?"${chars}*?)\\$${key}\\$(${chars}*?")(\\s*?)`,
      'g'
    )
    valueLists.push([regex, valueList])
  }

  console.log('Hosts:')
  console.log(pairs)
  console.log()
})

const fixWebAccessibleResources = function (content) {
  const obj = JSON.parse(content)

  const resources = obj.web_accessible_resources

  for (const resource of resources) {
    const matches = resource.matches
    const newMatches = []

    for (const match of Array.from(matches)) {
      const newMatch =
        /((?:\*|\w{3,5}):\/\/(?:\*|(?:\*\.)?[^*/]+)\/).*/.exec(match)[1] + '*'
      newMatches.push(newMatch)
    }

    resource.matches = newMatches
  }

  return JSON.stringify(obj, null, '  ')
}

module.exports = async function (buffer) {
  let content = buffer.toString()

  for (const [regex, valueList] of valueLists) {
    const replacer = function (...args) {
      const results = valueList.map((value) => args[1] + value + args[2])
      return results.join(',' + args[3])
    }

    content = content.replaceAll(regex, replacer)
  }

  content = fixWebAccessibleResources(content)

  return content
}
