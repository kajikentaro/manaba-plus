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

const valueLists = hosts.then(function (hosts) {
  const pairs = new Map()

  for (const host of hosts) {
    for (const key in host) {
      if (['name', 'source'].includes(key)) {
        continue
      }

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

  console.log('Hosts:')
  console.log(pairs)
  console.log()

  return Array.from(pairs.entries())
})

const exportHostList = async function () {
  const filePath = path.resolve('host-list.md')

  const stream = fs.createWriteStream(filePath)

  stream.on('error', function (error) {
    console.log(error.message)
  })

  for (const host of await hosts) {
    const name = host.name
    const source = host.source

    if (!name || !source) {
      console.log(host)
    }

    stream.write(`- ${name} [->](${source})\n`)
  }

  stream.end()
}

module.exports = {
  valueLists,
  exportHostList,
}
