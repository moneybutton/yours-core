var bitcore = require('bitcore')
var Peer = require('./lib/peer')

var Content = require('./lib/content')
var ContentStore = require('./lib/contentStore')
var ContentDiscovery = require('./lib/contentDiscovery')
var User = require('./lib/user')
var Message = require('./lib/message')
var Datt = require('./lib/datt')

module.exports = {
  'Content': Content,
  'ContentStore': ContentStore,
  'ContentDiscovery': ContentDiscovery,
  'User': User,
  'Message': Message,
  'Datt': Datt,
  'Peer': Peer,
  'bitcore': bitcore
}

global.datt_node = module.exports
