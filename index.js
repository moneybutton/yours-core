/**
 * The default export is Datt, the logic of the datt p2p protocol. Datt is what
 * you want to use to run a datt node, either in node.js or a web browser.  It
 * does not include the UI.
 */
require('fullnode')
module.exports = require('./lib/index')
