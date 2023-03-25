const hosts = require('./hosts')

// Entry point
module.exports = function () {
  hosts.exportHostList()
}
