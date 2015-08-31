var User = require('./user')
var Peer = require('./peer')
var Message = require('./message')
var ContentStore = require('./contentStore')
var Content = require('./content')
var ContentDiscovery = require('./contentDiscovery')
var events = require('events')

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
  this.contentListener = new events.EventEmitter()
}

Datt.prototype.init = function init () {
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
    .then(function (content) {
      return this.contentStore.putContent(content)
    }.bind(this))
})

Datt.prototype.pushContent = function pushContent (content) {}

// Will first try to find the content locally, then on the network
Datt.prototype.getContent = function getContent (hash) {
  var self = this

  var deferred = q.defer()

  self.getLocalContent(hash).then(function (localContent) {
    deferred.resolve(localContent)
  }).fail(function () {
    self.contentListener.once('Received:' + hash, function (remoteContent) {
      logger.debug('Received the remote content!')
      deferred.resolve(remoteContent)
    })
    self.getRemoteContent(hash)
  })

  return deferred.promise
}

Datt.prototype.getLocalContent = function getLocalContent (hash) {
  return this.contentStore.getContent(hash)
}

Datt.prototype.getRemoteContent = function getRemoteContent (hash) {
  return this.findPeersForContent(hash)
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
  var hash
  logger.debug('Got message: ' + message.serialize())
  switch (message.type) {
    case Message.Type.REQUEST_PEERS_FOR_HASH:
      logger.debug('Got peer request')
      this.contentDiscovery.handleContentDiscoveryRequest(message, this)
      break
    case Message.Type.ANNOUNCE_PEERS_FOR_HASH:
      hash = message.body.hash
      var peers = message.body.peers
      logger.debug('Got peers for hash ' + hash + ': ' + peers)
      this.contentDiscovery.handleAnnouncePeersForHash(message, this)
      break
    case Message.Type.REQUEST_CONTENT_BY_HASH:
      hash = message.body.hash
      var sender = message.body.sender
      logger.debug('peer ' + sender + ' is requesting content ' + hash)
      this.getContent(hash).then(function (content) {
        logger.debug('Sending content to ' + sender)
        this.sendMessage(Message.content(hash, content).serialize(), sender)
      }.bind(this)).fail(function (err) {
        logger.debug('Did not have content? ' + err)
      })
      break
    case Message.Type.CONTENT:
      hash = message.body.hash
      Content.fromObject(message.body.content).then(function (content) {
        logger.debug('Received content: ' + content.serialize())
        logger.debug('Adding content to local storage')
        this.addContent(content)
        this.contentListener.emit('Received:' + hash, content)
      }.bind(this))
      break
    default:
      logger.debug('Unknown message type')
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
  logger.debug('Sending message ' + message + ' to ' + receiverId)

  var p = []
  var peerConnection = this.connections[receiverId]
  p.push(q.nbind(peerConnection.send, peerConnection)(message))
  return q.all(p)
}

module.exports = Datt
