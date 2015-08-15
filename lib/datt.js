var User = require('./user')
var Peer = require('./peer')

var u = require('underscore')

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

  this.peer.on('open', function () {
    console.log('PeerJS connected!')
    if (self.config && self.config.onOpen && typeof (self.config.onOpen) === 'function') {
      try {
        self.config.onOpen()
      } catch (exc) {}
    }
    self.getPeers()
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

Datt.prototype.signIn = function signIn (user, password) {
  this.user = new User(user, password)
  if (this.user) {
    this.announceIdentity()
  }
  return this.user
}

Datt.prototype.pushContent = function pushContent (content) {}

Datt.prototype.askPeersForContent = function askPeersForContent (hash) {
  this.broadcastMessage(hash)
}

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

Datt.prototype.broadcastMessage = function broadcastMessage (message) {
  for (var peerConnectionKey in this.connections) {
    var peerConnection = this.connections[peerConnectionKey]
    peerConnection.send(message)
  }
}

module.exports = Datt
