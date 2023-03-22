const hosts = require('./hosts')

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

  const valueLists = []

  valueLists.push(...(await hosts.valueLists))

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
