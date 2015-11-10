if (process.browser) {
  module.exports = require('./network-browser-webrtc')
} else {
  module.exports = require('./network-node-webrtc')
}
