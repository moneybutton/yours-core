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
let Struct = require('fullnode/lib/struct')
let EventEmitter = require('events')
let NetworkWebRTC = require('./network-webrtc')
// let NetworkSocket = require('./network-socket')
let spawn = require('./spawn')

function Peers (networks, connections) {
  if (!(this instanceof Peers)) {
    return new Peers(networks, connections)
  }
  this.initialize()
  this.fromObject({networks, connections})
}

Peers.prototype = Object.create(Struct.prototype)
Peers.prototype.constructor = Peers
Object.assign(Peers.prototype, EventEmitter.prototype)

Peers.prototype.initialize = function () {
  this.networks = {}
  this.connections = []
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

Peers.prototype.asyncConnect = function (connectionInfo) {
  return spawn(function *() {
    let type = connectionInfo.getType()
    let network
    if (type === 'webrtc') {
      network = this.networks.webrtc
    } else if (type === 'socket') {
      throw new Error('socket connections not implemented yet')
    } else {
      throw new Error('connection type ' + type + ' not supported')
    }
    let connection = yield network.asyncConnect(connectionInfo)
    this.connections.push({connection, network})
    return {connection, network}
  }.bind(this))
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
