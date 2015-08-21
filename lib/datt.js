var User = require('./user')
var Peer = require('./peer')
var Message = require('./message')

var u = require('underscore')
var q = require('q')

function Datt (coordinationServerConfig) {
  var config = u.extend({
    debug: 3,
    host: 'localhost', /** default to localhost **/
    port: 9000,
    path: '/peers'
  }, coordinationServerConfig)

  this.config = coordinationServerConfig
  this.peer = new Peer(config)
  this.peers = null
  this.user = null

}

Datt.prototype.begin = function begin () {
  var self = this

  var deferred = q.defer()

  this.peer.on('error', function () {
    deferred.reject(new Error('Could not listen for connections'))
  })

  this.peer.on('open', function () {
    console.log('PeerJS connected!')
    if (self.config && self.config.onOpen && typeof (self.config.onOpen) === 'function') {
      try {
        self.config.onOpen()
      } catch (exc) {}
    }
    // TODO: There should proably be a "main event loop" somewhere that handles
    // the logic of finding and connecting to peers. Whatever that function is
    // should also probably be an EventEmitter that creates events and listens
    // for posted data and whatnot.
    self.getPeers()
    deferred.resolve()
  })

  this.getPeers = function refreshPeers () {
    self.peer.listAllPeers(function (peers) {
      console.log('Datt got peers!')
      self.peers = peers
      if (self.config && self.config.onPeers && typeof (self.config.onPeers) === 'function') {
        try {
          self.config.onPeers(peers)
        } catch(exc) {}
      }
      if (!self.peer.connections.length) {
        self._connectToAvailablePeers()
      }
    })
  }

  this.peer.on('connection', function (dataConnection) {
    var peerId = (dataConnection && dataConnection.peer ? dataConnection.peer : null)
    console.log("New connection from '" + peerId + "'")
    self._setupNewConnection(dataConnection)
  })

  return deferred.promise
}

Datt.prototype._setupNewConnection = function _setupNewConnection (dataConnection) {
  var peerId = (dataConnection && dataConnection.peer ? dataConnection.peer : null)
  var self = this
  try {
    console.log(JSON.stringify(dataConnection, null, 4))
  } catch(exc) {}
  console.log('')
  if (self.config && self.config.onConnection && typeof (self.config.onConnection) === 'function') {
    try {
      self.config.onConnection(dataConnection)
    } catch(exc) {}
  }

  dataConnection.on('data', function (data) {
    console.log("Connection w/ '" + peerId + "' sent data:")
    try {
      console.log(data)
    } catch (exc) {}

    if (self.config && self.config.onConnectionData && typeof (self.config.onConnectionData) === 'function') {
      try {
        self.config.onConnectionData(data, dataConnection)
      } catch(exc) {}
    }
  })

  if (self.peers.indexOf(peerId) === -1) {
    self.peers.push(peerId)
  }
  self.connections = self.connections || {}
  self.connections[peerId] = dataConnection
}

/**
 * Authenticate with a username and password. This function is asynchronous
 * because authenticating involves cryptography, which should be run in a
 * separate process (node) or web worker (browser). That is not yet actually
 * implemented.
*/
Datt.prototype.signIn = function signIn (username, password) {
  var deferred = q.defer()
  this.user = new User(username, password)
  if (this.user) {
    this.announceIdentity()
  }
  deferred.resolve(this.user)
  return deferred.promise
}

Datt.prototype.pushContent = function pushContent (content) {}

Datt.prototype.askPeersForContent = function askPeersForContent (hash) {
  if (hash) {
    this.broadcastMessage(Message.contentRequestByHash(hash))
  }
}

Datt.prototype.askPeersForContent = function askPeersForContentByUser (user) {}

Datt.prototype.announceIdentity = function announceIdentity () {
  if (!this.user) {
    throw new Error('Need to be signed in to announce identity!')
  } else {
    this.broadcastMessage(this.user.serialize())
  }
}

Datt.prototype._connectToAvailablePeers = function _refreshConnections () {
  this.connections = this.connections || {}
  for (var peerKey in this.peers) {
    var peer = this.peers[peerKey]
    if (peer === this.peer.id) {
      continue
    }
    var dataConnection = this.peer.connect(peer)
    console.log("Connecting to peer '" + peer + "'")
    this._setupNewConnection(dataConnection)
  }
}

/**
 * Send a message to all peers. Returns a promise that resolves when all
 * messages are sent. Rejects if there is an error sending to at least one
 * peer.
 */
Datt.prototype.broadcastMessage = function broadcastMessage (message) {
  var p = []
  for (var peerConnectionKey in this.connections) {
    var peerConnection = this.connections[peerConnectionKey]
    p.push(q.nbind(peerConnection.send, peerConnection)(message))
  }
  return q.all(p)
}

module.exports = Datt
