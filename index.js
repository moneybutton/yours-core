var bitcore = require('bitcore')
var Peer = require('./lib/peer')

var Content = require('./lib/content')
var ContentStore = require('./lib/contentstore')
var User = require('./lib/user')
var Message = require('./lib/message')
var Main = require('./lib/main')
var logger = require('./lib/logger')

module.exports = {
  'Content': Content,
  'ContentStore': ContentStore,
  'Main': Main,
  'Message': Message,
  'Peer': Peer,
  'User': User,
  'bitcore': bitcore,
  'logger': logger
}

module.exports.create = function () {
  var main = Object.create(Main.prototype)
  Main.apply(main, arguments)
  return main
}

global.DattNode = module.exports
