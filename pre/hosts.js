const fs = require('fs')
const glob = require('glob')
const path = require('path')

const hosts = glob('hosts/*.json', {
  ignore: '*/_.json',
}).then(function (hostFiles) {
  return hostFiles.map(function (hostFile) {
    const hostFilePath = path.resolve(hostFile)
    return require(hostFilePath)
  })
})

const getValueLists = async function () {
  const pairs = new Map()

  for (const host of await hosts) {
    delete host.name
    delete host.source

    for (const key in host) {
      const valueList = pairs.get(key) ?? []
      const value = host[key]

      if (typeof value === 'string') {
        valueList.push(value)
      } else {
        valueList.push(...value)
      }

      pairs.set(key, valueList)
    }
  }

  const chars = /(?:[^"]|\\["])/.source
  const valueLists = []

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

  return valueLists
}

const exportHostList = async function () {
  const filePath = path.resolve('host-list.md')

  const stream = fs.createWriteStream(filePath)

  stream.on('error', function (error) {
    console.log(error.message)
  })

  for (const host of await hosts) {
    const name = host.name
    const source = host.source
    if (!name) {
      console.log(host)
    }
    stream.write(`- ${name} [->](${source})\n`)
  }

  stream.end()
}

module.exports = {
  getValueLists,
  exportHostList,
}
