if (process.browser) {
  module.exports = require('./peer-peerjs')
} else {
  module.exports = require('./peer-wrtc')
}
