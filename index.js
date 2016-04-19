/**
 * The default export is YoursCore, the logic of the yourscore p2p protocol. YoursCore is what
 * you want to use to run a yourscore node, either in node.js or a web browser.  It
 * does not include the UI.
 */
require('fullnode')
module.exports = require('./lib/index')
