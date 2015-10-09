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
let PeerJS = require('peerjs')
let Struct = require('fullnode/lib/struct')
let Constants = require('./constants')
let EventEmitter = require('events')
let Random = require('fullnode/lib/random')
let Connection = require('./connection-browser-webrtc')

let Network = function NetworkBrowserWebRTC (id, rendezvous, peerjs) {
  if (!(this instanceof Network)) {
    return new Network(id, rendezvous, peerjs)
  }
  this.initialize()
  this.fromObject({id, rendezvous, peerjs})
}

Network.prototype = Object.create(Struct.prototype)
Network.prototype.constructor = Network
Object.assign(Network.prototype, EventEmitter.prototype)

Network.prototype.initialize = function () {
  // Rather than an ip address, a web RTC network node has an id and a
  // rendezvous server where it can be found.
  this.deferclose = {}
  this.id = Random.getRandomBuffer(16).toString('hex')
  this.rendezvous = Constants.Network.rendezvous
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
    peerjs.on('error', error => {
      // We might not have connected - so reject (it is safe to do this after
      // resolving)
      reject(error)
      this.asyncHandleError(error)
    })
    peerjs.on('connection', this.asyncHandleConnection.bind(this))
    peerjs.on('disconnected', this.asyncHandleDisconnected.bind(this))
  })
}

/**
 * You shouldn't normally run this by hand. This is async for testing purposes.
 */
Network.prototype.asyncHandleError = function (error) {
  return new Promise((resolve, reject) => {
    if (this.deferclose.reject) {
      this.deferclose.reject(error)
      this.close()
    }
    resolve()
  })
}

/**
 * Call this to wait for your network to end naturally or to be closed by an
 * error.
 */
Network.prototype.asyncWhenClosed = function () {
  return new Promise((resolve, reject) => {
    this.deferclose.resolve = resolve
    this.deferclose.reject = reject
  })
}

Network.prototype.close = function () {
  if (this.deferclose.resolve) {
    this.deferclose.resolve()
    this.deferclose = {}
  }
  if (this.peerjs) {
    this.peerjs.disconnect()
    this.peerjs = undefined
  }
  return this
}

/**
 * You shouldn't normally run this by hand. This is async for testing purposes.
 */
Network.prototype.asyncHandleConnection = function (peerjsConnection) {
  return new Promise((resolve, reject) => {
    let connection = Connection(peerjsConnection)
    this.emit('connection', connection)
    resolve()
  })
}

/**
 * You shouldn't normally run this by hand. This is async for testing purposes.
 */
Network.prototype.asyncHandleDisconnected = function () {
  return new Promise((resolve, reject) => {
    if (this.deferclose.resolve) {
      this.deferclose.resolve()
      this.deferclose = {}
    }
  })
}

module.exports = Network
