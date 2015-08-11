if (process.browser) {
  module.exports = require('./contentStore-browser')
} else {
  module.exports = require('./contentStore-nodejs')
}
