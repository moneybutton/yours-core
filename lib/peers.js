/**
 * Peers
 * =====
 *
 * Manage p2p connections. This code understands the difference between web
 * sockets and web RTC and uses the appropriate underlying network code. This
 * code should run both in node and a browser. This class does NOT understand
 * the database, and therefore is not capable of responding to messages that
 * query content. That will be handled by CorePeers, which is directly used by
 * dattcore.
 */
'use strict'
let ConnectionInfo = require('./connection-info')
let Struct = require('fullnode/lib/struct')
let EventEmitter = require('events')
let NetworkWebRTC = require('./network-webrtc')
// let NetworkSocket = require('./network-socket')
let spawn = require('./spawn')

function Peers (networkWebRTC, networkSocket) {
  if (!(this instanceof Peers)) {
    return new Peers(networkWebRTC, networkSocket)
  }
  this.fromObject({networkWebRTC, networkSocket})
}

Peers.prototype = Object.create(Struct.prototype)
Peers.prototype.constructor = Peers
Object.assign(Peers.prototype, EventEmitter.prototype)

Peers.prototype.asyncInitialize = function () {
  return spawn(function *() {
    // TODO: Also support socket connections
    // TODO: Support multiple different WebRTC rendezvous servers
    this.networkWebRTC = NetworkWebRTC()
    yield this.networkWebRTC.asyncInitialize()
    this.monitorNetworkWebRTC()
  }.bind(this))
}

Peers.prototype.monitorNetworkWebRTC = function () {
  this.networkWebRTC.on('error', this.handleNetworkWebRTCError.bind(this))
  this.networkWebRTC.on('connection', this.handleNetworkWebRTCConnection.bind(this))
  this.networkWebRTC.on('disconnected', this.handleNetworkWebRTCDisconnected.bind(this))
  this.networkWebRTC.on('msg', this.handleNetworkWebRTCMsg.bind(this))
  return this
}

Peers.prototype.handleNetworkWebRTCError = function (error) {
  // TODO: What should we do with an error besides emit it?
  this.emit('error', error)
  return this
}

Peers.prototype.handleNetworkWebRTCConnection = function (connection) {
  this.emit('connection', {
    network: this.networkWebRTC,
    connection: connection
  })
  return this
}

Peers.prototype.handleNetworkWebRTCDisconnected = function () {
  // TODO: When disconnected from signalling server, we should either try to
  // re-connect, or perhaps throw an error.
  this.emit('disconnected')
  return this
}

Peers.prototype.handleNetworkWebRTCMsg = function (obj) {
  this.emit('msg', {
    network: this.networkWebRTC,
    connection: obj.connection,
    msg: obj.msg
  })
  return this
}

/**
 * Save the current list of peers to an object.
 */
Peers.prototype.toJSON = function () {
  // TODO: Also support web sockets
  let connections = []
  if (this.networkWebRTC) {
    this.networkWebRTC.connections.forEach(connection => {
      connections.push({
        type: 'webrtc',
        id: connection.getId(),
        rendezvous: this.networkWebRTC.rendezvous
      })
    })
  }
  return connections
}

Peers.connectionInfosFromJSON = function (json) {
  return json.map(obj =>
    ConnectionInfo()
      .setType(obj.type)
      .setObj({id: obj.id, rendezvous: obj.rendezvous})
  )
}

/**
 * Connect to a list of peers provided by a JSON object (the format of which
 * must match that outputted by .toJSON()).
 */
Peers.prototype.asyncConnectManyFromJSON = function (json) {
  let connectionInfos = Peers.connectionInfosFromJSON(json)
  return this.asyncConnectMany(connectionInfos)
}

/**
 * Connect to many peers at once. Resolves with the number of peers we were
 * able to connect to.
 */
Peers.prototype.asyncConnectMany = function (connectionInfos) {
  return spawn(function *() { //eslint-disable-line
    let successes = 0
    for (let connectionInfo of connectionInfos) {
      try {
        yield this.asyncConnect(connectionInfo)
        successes++
      } catch (err) {
      }
    }
    return Promise.resolve(successes)
  }.bind(this))
}

Peers.prototype.asyncConnect = function (connectionInfo) {
  return spawn(function *() {
    let type = connectionInfo.getType()
    let network
    if (type === 'webrtc') {
      network = this.networkWebRTC
    } else if (type === 'socket') {
      // TODO: Support web sockets
      throw new Error('socket connections not implemented yet')
    } else {
      throw new Error('connection type ' + type + ' not supported')
    }
    let connection = yield network.asyncConnect(connectionInfo)
    return {connection, network}
  }.bind(this))
}

Peers.prototype.broadcastMsg = function (msg) {
  // TODO: Work for web sockets also
  if (this.networkWebRTC) {
    this.networkWebRTC.connections.forEach(connection => {
      connection.sendMsg(msg)
    })
  }
  return this
}

Peers.prototype.close = function () {
  if (this.networkWebRTC) {
    this.networkWebRTC.close()
  }
  // TODO: Also close web socket connections
  return this
}

module.exports = Peers
