/* global Fullnode */
/**
 * NetworkBrowserWebRTC
 * ====================
 *
 * First of all, NetworkBrowserWebRTC is what you use to make and receive
 * connections from a browser with Web RTC. Unfortunately to make our p2p
 * protocol work across web browsers and servers, we have to support multiple
 * network types, which makes things complicated. A 'network' refers to a
 * particular underlying network protocol, usually either web sockets or web
 * RTC. A connection is made over a network - i.e., a connection can be over
 * web sockets or over web RTC. While a connection is made over a network, it
 * is not the case that a connection object posseses a network.
 */
'use strict'
let Connection = require('./connection-browser-webrtc')
let ConnectionInfo = require('./connectioninfo')
let Constants = require('./constants')
let EventEmitter = require('events')
let PeerJS = require('peerjs')
let Random = Fullnode.Random
let Struct = Fullnode.Struct
let asyncDelay = require('asyncdelay')

let Network = function NetworkBrowserWebRTC (rendezvous, id, peerjs, connections) {
  if (!(this instanceof Network)) {
    return new Network(rendezvous, id, peerjs, connections)
  }
  this.initialize()
  this.fromObject({rendezvous, id, peerjs, connections})
}

Network.prototype = Object.create(Struct.prototype)
Network.prototype.constructor = Network
Object.assign(Network.prototype, EventEmitter.prototype)

Network.prototype.initialize = function () {
  // Rather than an ip address, a web RTC network node has an id and a
  // rendezvous server where it can be found.
  this.id = Random.getRandomBuffer(16).toString('hex')
  this.rendezvous = Constants.Network.rendezvous
  this.connections = []
  return this
}

/**
 * Connects to rendezvous server and resolves when we are ready to start
 * receiving or making connections.
 */
Network.prototype.asyncInitialize = function () {
  return new Promise((resolve, reject) => {
    let id = this.id
    let rendezvous = this.rendezvous
    let peerjs = this.peerjs = new PeerJS(id, rendezvous)

    peerjs.on('open', resolve)
    peerjs.on('error', (error) => {
      // We might not have connected - so reject (it is safe to do this after
      // resolving)
      reject(error)
      this.handleError(error)
    })
    peerjs.on('connection', this.handleConnection.bind(this))
    peerjs.on('disconnected', this.handleDisconnected.bind(this))
    asyncDelay(Constants.timeout).then(() => {
      let error = new Error('timeout initializing network')
      reject(error)
      this.handleError(error)
    })
    return this
  })
}

/**
 * You shouldn't normally run this by hand. This is async for testing purposes.
 */
Network.prototype.handleError = function (error) {
  this.emit('error', error)
  return this
}

Network.prototype.close = function () {
  if (this.peerjs) {
    this.peerjs.disconnect()
    this.peerjs = undefined
  }
  return this
}

/**
 * You shouldn't normally run this by hand.
 */
Network.prototype.handleConnection = function (peerjsConnection) {
  let connection = Connection(peerjsConnection)
  connection.monitor()
  this.monitorConnection(connection)
  this.emit('connection', connection)
  return this
}

/**
 * You shouldn't normally run this by hand. This is async for testing purposes.
 */
Network.prototype.handleDisconnected = function () {
  // disconnected from signalling server
  // http://peerjs.com/docs/#peeron-disconnected
  this.emit('disconnected')
  return this
}

/**
 * Get "our" connection info - i.e., the info that other peers need to connect
 * to us.
 */
Network.prototype.getConnectionInfo = function () {
  let connectionInfo = ConnectionInfo()
    .setType('webrtc')
    .setObj({
      id: this.id,
      rendezvous: this.rendezvous
    })
  return connectionInfo
}

Network.prototype.isSameNetwork = function (connectionInfo) {
  let type = connectionInfo.getType()
  if (type !== 'webrtc') {
    return false
  }
  let obj = connectionInfo.getObj()
  if (!obj.id) {
    return false
  }
  if (obj.rendezvous.port !== this.rendezvous.port ||
      obj.rendezvous.host !== this.rendezvous.host ||
      obj.rendezvous.path !== this.rendezvous.path) {
    return false
  }
  return true
}

Network.prototype.removeConnection = function (connection) {
  let index = this.connections.findIndex((_connection) => _connection === connection)
  if (index >= 0) {
    this.connections.splice(index, 1)
  }
  return this
}

Network.prototype.monitorConnection = function (connection) {
  this.connections.push(connection)
  connection.on('close', this.handleConnectionClose.bind(this, connection))
  connection.on('dmsg', this.handleConnectionDMsg.bind(this, connection))
  return this
}

Network.prototype.handleConnectionClose = function (connection) {
  this.removeConnection(connection)
  return this
}

Network.prototype.handleConnectionDMsg = function (connection, msg) {
  this.emit('dmsg', {connection, msg})
  return this
}

/**
 * Given a peer's connectionInfo, resolves a connection if we can connect to
 * them, or rejects if we can't.
 */
Network.prototype.asyncConnect = function (connectionInfo) {
  return new Promise((resolve, reject) => {
    if (!this.isSameNetwork(connectionInfo)) {
      throw new Error('invalid connectionInfo for this network')
    }
    let obj = connectionInfo.getObj()
    let peerjsConnection = this.peerjs.connect(obj.id)
    let connection
    peerjsConnection.on('open', () => {
      connection = Connection(peerjsConnection)
      connection.monitor()
      this.monitorConnection(connection)
      this.emit('connection', connection)
      resolve(connection)
    })
    peerjsConnection.on('error', reject)
    asyncDelay(Constants.timeout).then(() => {
      reject(new Error('timeout connecting to peer ' + obj.id))
    })
  })
}

/**
 * Methods unique to Web RTC
 * -------------------------
 */

/**
 * This method is a window directly to PeerJS' undocumented "listAllPeers"
 * method. This is useful for development purposes, but is not a good way to
 * get peers for production. To do peer discovery properly, we should provide a
 * list of reliable peers, then build-in a peer discovery method into the p2p
 * protocol. So this method should ultimately be removed. If we keep this in,
 * it won't scale very well (imagine getting a list of 1 million peers - that
 * would be awfully slow).
 *
 * TODO: Replace this method with a peer discovery method built into the p2p
 * protocol.
 */
Network.prototype.asyncGetAllWebRTCPeerIDs = function () {
  return new Promise((resolve, reject) => {
    this.peerjs.listAllPeers((peers) => {
      resolve(peers)
    })
    asyncDelay(Constants.timeout).then(() => {
      reject(new Error('timeout getting list of peers'))
    })
  })
}

module.exports = Network
