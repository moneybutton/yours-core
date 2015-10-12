if (process.browser) {
  module.exports = require('./network-browser-socket')
} else {
  module.exports = require('./network-node-socket')
}
