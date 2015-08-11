/** JUST A STUB - placeholder for now **/
var u = require('underscore')

function Peer (options) {
  this.connections = []
  this.options = u.extend({
    id: randomToken(),
    host: 'localhost',
    port: 9000,
    path: '/peers'
  }, options)
  this.id = this.options.id
}
function randomToken () {
  return Math.random().toString(36).substr(2)
}

module.exports = Peer
