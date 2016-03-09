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
let DBContentAuth = require('./db-content-auth')
let DBPeers = require('./db-peers')
let EventEmitter = require('events')
let MsgContentAuth = require('./msg-content-auth')
let MsgPing = require('./msg-ping')
let MsgPong = require('./msg-pong')
let Peers = require('./peers')
let Struct = require('fullnode').Struct
let asink = require('asink')

function CorePeers (config, db, dbpeers, peers) {
  if (!(this instanceof CorePeers)) {
    return new CorePeers(config, db, dbpeers, peers)
  }
  this.initialize()
  this.fromObject({config, db, dbpeers, peers})
}

CorePeers.prototype = Object.create(Struct.prototype)
CorePeers.prototype.constructor = CorePeers
Object.assign(CorePeers.prototype, EventEmitter.prototype)

CorePeers.prototype.initialize = function () {
  this.config = {}
  this.dbpeers = DBPeers()
  this.peers = Peers()
  return this
}

CorePeers.prototype.asyncInitialize = function () {
  return asink(function *() {
    this.peers = Peers(this.config)
    yield this.peers.asyncInitialize()
    this.monitorPeers()
    this.dbpeers = DBPeers(this.db, this.peers)
  }, this)
}

/**
 * Reconnect to peers from DB.
 */
CorePeers.prototype.asyncReconnectDBPeers = function () {
  return asink(function *() {
    let peersJSON
    try {
      peersJSON = yield this.dbpeers.asyncGetJSON()
    } catch (err) {
      peersJSON = []
    }
    // TODO: Also do peer discovery and connect to new peers.
    return this.peers.asyncConnectManyFromJSON(peersJSON)
  }, this)
}

CorePeers.prototype.disconnectFromError = function (network, connection, error) {
  error = new Error('disconnected from error: ' + error)
  this.emit('error', error)
  connection.close()
  return this
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

/**
 * Hande a received msg. Note that at this point we know that the msg is indeed
 * a valid msg - that is, msg.validate() has been run. However, we have *not*
 * validated the message type. CorePeers is responsible for validating those.
 */
CorePeers.prototype.asyncHandleMsg = function (obj) {
  return asink(function *() {
    // TODO: This is where validating and processing most messages should occur.
    // Emit all network message objects so that a listener can see all messages
    // if desired.
    this.emit('msg', obj)

    let msg = obj.msg
    let connection = obj.connection
    let network = obj.network
    let cmd = msg.getCmd()
    try {
      switch (cmd) {
        case 'ping':
          this.handleMsgPing(obj)
          break
        case 'pong':
          this.handleMsgPong(obj)
          break
        case 'contentauth':
          yield this.asyncHandleMsgContentAuth(obj)
          break
        default:
          let error = new Error('asyncHandleMsg unknown cmd: ' + cmd)
          this.disconnectFromError(network, connection, error)
          break
      }
    } catch (err) {
      let error = new Error('error parsing msg: ' + err)
      this.disconnectFromError(network, connection, error)
    }
    return this
  }, this)
}

CorePeers.prototype.handleMsgPing = function (obj) {
  let msg = obj.msg
  let connection = obj.connection
  let network = obj.network

  try {
    let msgPing = MsgPing().fromMsg(msg).validate()
    let msgPong = MsgPong().fromMsgPing(msgPing)
    connection.sendMsg(msgPong.toMsg())
  } catch (err) {
    let error = new Error('asyncHandleMsgPing: ' + err)
    this.disconnectFromError(network, connection, error)
    return this
  }

  return this
}

CorePeers.prototype.handleMsgPong = function (obj) {
  // TODO: Check to make sure only received after a ping?
  return this
}

CorePeers.prototype.asyncHandleMsgContentAuth = function (obj) {
  return asink(function *() {
    // TODO: We should probably check to see if the content is already in the
    // db before validating it.
    let msg = obj.msg
    let network = obj.network
    let connection = obj.connection
    let msgcontentauth, contentauth
    try {
      msgcontentauth = MsgContentAuth().fromMsg(msg)
      contentauth = msgcontentauth.contentauth
      yield contentauth.asyncValidate()
    } catch (err) {
      let error = new Error('content-auth validation failed: ' + err)
      this.disconnectFromError(network, connection, error)
      return this
    }
    yield DBContentAuth(this.db).asyncSave(contentauth)
    this.emit('content-auth', {network, connection, contentauth})
    return this
  }, this)
}

CorePeers.prototype.asyncConnect = function (connectionInfo) {
  return this.peers.asyncConnect(connectionInfo)
}

CorePeers.prototype.close = function () {
  this.peers.close()
  return this
}

CorePeers.prototype.numActiveConnections = function () {
  return this.peers.numActiveConnections()
}

CorePeers.prototype.asyncDiscoverAndConnect = function () {
  // yield this.asyncReconnectDBPeers()
  return this.peers.asyncDiscoverAndConnect()
}

CorePeers.prototype.broadcastMsg = function (msg) {
  this.peers.broadcastMsg(msg)
  return this
}

module.exports = CorePeers
