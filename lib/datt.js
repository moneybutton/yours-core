var User = require('./user')
var Peer = require('./peer')
var Message = require('./message')
var ContentStore = require('./contentStore')
var Content = require('./content')
var ContentDiscovery = require('./contentDiscovery')

var u = require('underscore')
var q = require('q')

var logger = require('./logger')

function Datt (coordinationServerConfig) {
  var config = u.extend({
    debug: 3,
    host: 'localhost', /** default to localhost **/
    port: 3000,
    path: '/'
  }, coordinationServerConfig)

  this.config = coordinationServerConfig
  this.peer = new Peer(config)
  this.peers = null
  this.user = null
  this.contentDiscovery = new ContentDiscovery()
}

Datt.prototype.begin = function begin () {
  var self = this

  var deferred_peers = q.defer()
  var p_peers = deferred_peers.promise

  this.peer.on('error', function () {
    deferred_peers.reject(new Error('Could not listen for connections'))
  })

  this.peer.on('open', function () {
    logger.debug('PeerJS connected!')
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
    deferred_peers.resolve()
  })

  this.getPeers = function refreshPeers () {
    self.peer.listAllPeers(function (peers) {

      logger.debug('Datt got peers!')

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
    logger.debug("New connection from '" + peerId + "'")
    self._setupNewConnection(dataConnection)
  })

  this.contentStore = new ContentStore('datt-store')
  var p_contentStore = this.contentStore.init()

  return q.all([p_contentStore, p_peers])
}

Datt.prototype._setupNewConnection = function _setupNewConnection (dataConnection) {
  var peerId = (dataConnection && dataConnection.peer ? dataConnection.peer : null)
  var self = this
  try {
    logger.debug(JSON.stringify(dataConnection, null, 4))
  } catch(exc) {}
  logger.debug('')
  if (self.config && self.config.onConnection && typeof (self.config.onConnection) === 'function') {
    try {
      self.config.onConnection(dataConnection)
    } catch(exc) {}
  }

  dataConnection.on('data', function (data) {
    logger.debug("Connection w/ '" + peerId + "' sent data:")
    try {
      logger.debug(data)
      console.log(data)
      var message = Message.fromObject(JSON.parse(data))
      self.handleReceivedMessage(message)
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
  this.user = new User(username, password)
  return this.user.init().then(function () {
    if (this.user) {
      this.announceIdentity()
    }
    return this.user
  }.bind(this))
}

Datt.prototype.addContent = q.promised(function addContent (content) {
  if (typeof (content) === 'string') {
    if (!this.user) {
      throw new Error('Datt#addContent: user must be signed in to create new content!')
    }
    content = new Content(content, this.user.getUsername(), this.user.getAddress(), null, null, this.user.getPubKey(), this.user.sign(content))
  }

  return content.init()
    .then(
      (function (content) {
        return this.contentStore.putContent(content)
      }).bind(this)
  )
})

Datt.prototype.pushContent = function pushContent (content) {}

Datt.prototype.getContent = function getContent (hash) {
  return this.contentStore.getContent(hash)
}

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

Datt.prototype.handleReceivedMessage = function handleReceivedMessage (message) {
  var self = this
  console.log("Got message: " + message.serialize())
  switch (message.type) {
    case Message.Type.REQUEST_PEERS_FOR_HASH:
      console.log("Got peer request")
      self.contentDiscovery.handleContentDiscoveryRequest(message, this)
      break
    case Message.Type.ANNOUNCE_PEERS_FOR_HASH:
      var hash = message.body.hash
      var peers = message.body.peers 
      console.log("Got peers for hash " + hash + ": " + peers)
      self.contentDiscovery.handleAnnouncePeersForHash(message, this)
      break
    case Message.Type.REQUEST_CONTENT_BY_HASH:
      var hash = message.body.hash
      var sender = message.body.sender
      console.log("peer " + sender + " is requesting content " + hash)
      self.getContent(hash).then(function(content) {
        console.log("Sending content to " + sender)
        self.sendMessage(Message.content(hash, content).serialize(), sender)
      }).fail(function(err) {
        console.log("Did not have content? " + err)
      }) 
      break
    case Message.Type.CONTENT:
      var hash = message.body.hash
      Content.fromObject(message.body.content).then(function(content) {
        console.log("Received content: " + content.serialize())
      })
      break
    default:
      console.log('Unknown message type')
  }
}

Datt.prototype.findPeersForContent = function findPeersForContent (hash) {
  this.contentDiscovery.findPeersForContent(hash, this)
}

Datt.prototype._connectToAvailablePeers = function _refreshConnections () {
  this.connections = this.connections || {}
  for (var peerKey in this.peers) {
    var peer = this.peers[peerKey]
    if (peer === this.peer.id) {
      continue
    }
    var dataConnection = this.peer.connect(peer)
    logger.debug("Connecting to peer '" + peer + "'")
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

Datt.prototype.sendMessage = function sendMessage (message, receiverId) {
  console.log("Sending message " + message + " to " + receiverId)

  var p = []
  var peerConnection = this.connections[receiverId]
  p.push(q.nbind(peerConnection.send, peerConnection)(message))
  return q.all(p)
}

module.exports = Datt
