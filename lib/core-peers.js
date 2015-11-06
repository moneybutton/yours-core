/**
 * CorePeers
 * =========
 *
 * An API for controlling peers. Can establish connections and receive
 * connections to peers on the datt p2p network. This is what's used by
 * dattcore. It is primarily a link to Peers, which actually manages the peers,
 * and DBPeers, which also keeps peer information stored in the database.
 */
'use strict'
let DBPeers = require('./db-peers')
let EventEmitter = require('events')
let MsgPing = require('./msg-ping')
let MsgPong = require('./msg-pong')
let Peers = require('./peers')
let Struct = require('fullnode/lib/struct')
let spawn = require('./spawn')

function CorePeers (db, dbpeers, peers) {
  if (!(this instanceof CorePeers)) {
    return new CorePeers(db, dbpeers, peers)
  }
  this.initialize()
  this.fromObject({db, dbpeers, peers})
}

CorePeers.prototype = Object.create(Struct.prototype)
CorePeers.prototype.constructor = CorePeers
Object.assign(CorePeers.prototype, EventEmitter.prototype)

CorePeers.prototype.initialize = function () {
  this.dbpeers = DBPeers()
  this.peers = Peers()
  return this
}

CorePeers.prototype.asyncInitialize = function () {
  return spawn(function *() {
    this.peers = Peers()
    yield this.peers.asyncInitialize()
    this.monitorPeers()
    this.dbpeers = DBPeers(this.db, this.peers)
  }.bind(this))
}

/**
 * Reconnect to peers from DB.
 */
CorePeers.prototype.asyncReconnectDBPeers = function () {
  return spawn(function *() {
    let peersJSON
    try {
      peersJSON = yield this.dbpeers.asyncGetJSON()
    } catch (err) {
      peersJSON = []
    }
    // TODO: Also do peer discovery and connect to new peers.
    return this.peers.asyncConnectManyFromJSON(peersJSON)
  }.bind(this))
}

CorePeers.prototype.monitorPeers = function () {
  this.peers.on('error', this.handleError.bind(this))
  this.peers.on('connection', this.handleConnection.bind(this))
  this.peers.on('disconnected', this.handleDisconnected.bind(this))
  this.peers.on('msg', this.asyncHandleMsg.bind(this))
  return this
}

CorePeers.prototype.handleError = function (err) {
  this.emit('error', err)
  return this
}

CorePeers.prototype.handleConnection = function (obj) {
  this.emit('connection', obj)
  return this
}

/**
 * Occurs when the network is disconnected from the signalling server. Does
 * *not* indicated a disconnected peer. We should probably change the
 * terminology of this.
 */
CorePeers.prototype.handleDisconnected = function () {
  // this.emit('disconnected')
  // TODO: should try to reconnect
  return this
}

CorePeers.prototype.asyncHandleMsg = function (obj) {
  return spawn(function *() {
    // TODO: This is where validating and processing most messages should occur.
    // Emit all network message objects so that a listener can see all messages
    // if desired.
    this.emit('msg', obj)

    let msg = obj.msg
    let connection = obj.connection
    let cmd = msg.getCmd()
    switch (cmd) {
      case 'ping':
        yield this.handleMsgPing(obj)
        break
      case 'pong':
        yield this.handleMsgPong(obj)
        break
      default:
        this.emit('error', new Error('asyncHandleMsg unknown cmd: ' + cmd))
        connection.close()
        break
    }
    return this
  }.bind(this))
}

CorePeers.prototype.handleMsgPing = function (obj) {
  let msg = obj.msg
  let connection = obj.connection

  try {
    let msgPing = MsgPing().fromMsg(msg).validate()
    let msgPong = MsgPong().fromMsgPing(msgPing)
    connection.sendMsg(msgPong.toMsg())
  } catch (err) {
    this.emit('error', new Error('asyncHandleMsgPing: ' + err))
    connection.close()
  }

  return this
}

CorePeers.prototype.handleMsgPong = function (obj) {
  // TODO: Check to make sure only received after a ping?
  return this
}

CorePeers.prototype.asyncConnect = function (connectionInfo) {
  return this.peers.asyncConnect(connectionInfo)
}

CorePeers.prototype.close = function () {
  this.peers.close()
  return this
}

CorePeers.prototype.broadcastMsg = function (msg) {
  this.peers.broadcastMsg(msg)
  return this
}

module.exports = CorePeers
