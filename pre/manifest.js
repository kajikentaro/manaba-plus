const hosts = require('./hosts')

/**
 * Replace placeholders with values.
 * The placeholders must be between `"`.
 * Multiple values of one key are joined with `,`.
 *
 * sample:
 * ```
 * replaceValues(`
 *   [
 *     "$fruit$"
 *   ]
 * `, [
 *   [
 *     'fruit',
 *     ['apple', 'orange', 'pear', 'grape']
 *   ]
 * ])
 * // Return `
 * //   [
 * //     "apple",
 * //     "orange",
 * //     "pear",
 * //     "grape"
 * //   ]
 * // `
 * ```
 * @param {string} content The string including placeholders
 * @param {[string, string[]][]} valueLists The key-value pairs
 * @returns The replaced string
 */
const replaceValues = function (content, valueLists) {
  const chars = /(?:[^"]|\\["])/.source

  for (const [key, valueList] of valueLists) {
    const regex = new RegExp(
      `(\\s*?"${chars}*?)\\$${key}\\$(${chars}*?")(\\s*?)`,
      'g'
    )

    const replacer = function (...args) {
      const results = valueList.map((value) => args[1] + value + args[2])
      return results.join(',' + args[3])
    }

    content = content.replaceAll(regex, replacer)
  }

  return content
}

/**
 * Fix `web_accessible_resources.matches` into the below style.
 *
 * `<scheme>://<host>/*`
 *
 * sample:
 * https://example.org/foo/bar -> https://example.org/*
 * @param {string} content The manifest JSON string
 * @returns The replaced manifest JSON string
 */
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

/**
 * Transform manifest JSON.
 * @param {Buffer} buffer The source buffer of manifest JSON
 * @returns The transformed manifest JSON string
 */
module.exports = async function (buffer) {
  let content = buffer.toString()

  const valueLists = []

  const version = process.env.npm_package_version
  valueLists.push(['version', [version]])

  valueLists.push(...(await hosts.valueLists))

  content = replaceValues(content, valueLists)

  content = fixWebAccessibleResources(content)

  return content
}
