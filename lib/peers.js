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

function Peers (networks) {
  if (!(this instanceof Peers)) {
    return new Peers(networks)
  }
  this.initialize()
  this.fromObject({networks})
}

Peers.prototype = Object.create(Struct.prototype)
Peers.prototype.constructor = Peers
Object.assign(Peers.prototype, EventEmitter.prototype)

Peers.prototype.initialize = function () {
  this.networks = {}
  return this
}

Peers.prototype.asyncInitialize = function () {
  // TODO: Also support socket connections
  // TODO: Support multiple different WebRTC rendezvous servers
  let networkWebRTC = NetworkWebRTC()
  return networkWebRTC.asyncInitialize().then(() => {
    this.networks.webrtc = networkWebRTC
  })
}

/**
 * Save the current list of peers to an object.
 */
Peers.prototype.toJSON = function () {
  // TODO: Also support web sockets
  let connections = []
  if (this.networks.webrtc) {
    this.networks.webrtc.connections.forEach(connection => {
      connections.push({
        type: 'webrtc',
        id: connection.getId(),
        rendezvous: this.networks.webrtc.rendezvous
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
  return spawn(function *() {
    let promises = connectionInfos.map(connectionInfo => this.asyncConnect(connectionInfo))
    let successes = 0
    for (let promise in promises) {
      try {
        yield promise
        successes++
      } catch (err) {
      }
    }
    return Promise.resolve(successes)
  })
}

Peers.prototype.asyncConnect = function (connectionInfo) {
  return spawn(function *() {
    let type = connectionInfo.getType()
    let network
    if (type === 'webrtc') {
      network = this.networks.webrtc
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
  if (this.networks.webrtc) {
    this.networks.webrtc.connections.forEach(connection => {
      connection.sendMsg(msg)
    })
  }
  return this
}

Peers.prototype.close = function () {
  if (this.networks.webrtc) {
    this.networks.webrtc.close()
  }
  // TODO: Also close web socket connections
  // this.networks.socket.close()
  return this
}

module.exports = Peers
