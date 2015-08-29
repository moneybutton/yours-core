if (process.browser) {
  module.exports = console
} else {
  module.exports = require('winston')
}
