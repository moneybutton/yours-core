var bitcore = require('bitcore')
var Peer = require('./lib/peer')

var Content = require('./lib/content')
var ContentStore = require('./lib/contentStore')
var ContentDiscovery = require('./lib/contentDiscovery')
var User = require('./lib/user')
var Message = require('./lib/message')
var Main = require('./lib/main')
var logger = require('./lib/logger')

module.exports = {
  'Content': Content,
  'ContentDiscovery': ContentDiscovery,
  'ContentStore': ContentStore,
  'Main': Main,
  'Message': Message,
  'Peer': Peer,
  'User': User,
  'bitcore': bitcore,
  'logger': logger
}

global.datt_node = module.exports
