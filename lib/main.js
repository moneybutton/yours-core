var User = require('./user')
var Peer = require('./peer')
var Message = require('./message')
var ContentStore = require('./contentstore')
var Content = require('./content')
var events = require('events')
var u = require('underscore')
var q = require('q')
var logger = require('./logger')
var util = require('util')

/**
 * Initiate the configuration for "Main", which is basically the main loop of
 * the application. This module handles establishing connections, and
 * processing received messages, and also provides an interface for a user of
 * the application to broadcast messages.
 *
 * TODO: I believe this module should be refactored into some distinct
 * components. One component should be the "Connection Manager" which manages
 * the connections, handles disconnects, reconnects, and connecting to new
 * peers, and providing an interface for connecting to hand-entered peers.
 * Another module is the "Message Handler" which responds to distinct message
 * types by accessing the database and responding to messages in the
 * appropriate way. And then the "Main" module, which initializes both of those
 * interfaces and connects them together.
 *
 * There might be other ways to refactor, but either way, we should distinguish
 * between the different pieces of "managing connections" and "responding to
 * messages".
 */
function Main (coordinationServerConfig, dbname, peer, peers, user, seenMessages, contentRequested) {
  var config = u.extend({
    debug: 3,
    host: 'localhost', /** default to localhost **/
    port: 3000,
    path: '/'
  }, coordinationServerConfig)

  this.config = config
  this.dbname = dbname || 'datt-store'
  this.peer = peer
  this.peers = peers || null
  this.user = user || null
  this.seenMessages = seenMessages || {}
  this.contentRequested = contentRequested || {}
}

util.inherits(Main, events.EventEmitter)

/**
 * Initialize Main, which sets up a listener for when we are connected to the
 * rendezvous server, and then requests a list of all peers, which we then
 * connect to. Also sets up a listener for what to do when we have a new
 * connection.
 */
Main.prototype.init = function init () {
  this.contentStore = new ContentStore(this.dbname)

  return this.contentStore.init()
  .then(this.peersListen.bind(this))
  .then(this.peersGetAll.bind(this))
  .then(this.peersConnectToAll.bind(this))
}

/**
 * Set up connection manager and listen for events, particularly for when a
 * peer wants to connect to us.
 */
Main.prototype.peersListen = function peersListen () {
  logger.debug('peersListen')
  this.peer = this.peer || new Peer(this.config)

  var deferred_peers = q.defer()
  var p_peers = deferred_peers.promise

  this.peer.on('error', function (err) {
    // TODO: Need to handle this error not just upon initialization, but in
    // general. For instance, if an error occurs well after the connection has
    // been established, we will reject the "peersListen" promise, even though
    // it has already been resolved.
    deferred_peers.reject(new Error('Could not listen for connections: ' + err))
  })

  this.peer.on('open', function () {
    logger.debug('PeerJS connected!')
    if (this.config && this.config.onOpen && typeof (this.config.onOpen) === 'function') {
      try {
        this.config.onOpen()
      } catch (exc) {}
    }
    // TODO: There should proably be a "main event loop" somewhere that handles
    // the logic of finding and connecting to peers. Whatever that function is
    // should also probably be an EventEmitter that creates events and listens
    // for posted data and whatnot.
    deferred_peers.resolve()
  }.bind(this))

  this.peer.on('connection', this.peerOnConnection.bind(this))

  return p_peers
}

Main.prototype.peerOnConnection = function peerOnConnection (dataConnection) {
  logger.debug('peerOnConnection')
  var peerId = (dataConnection && dataConnection.peer ? dataConnection.peer : null)
  logger.debug("New connection from '" + peerId + "'")
  return this._setupNewConnection(dataConnection)
}

/**
 * This method is called after we have connected to a rendezvous server and
 * received a list of candidate peers. This method takes that list and try to
 * connect to every one of the available peers.
 */
Main.prototype.peersConnectToAll = function peersConnectToAll () {
  logger.debug('peersConnectToAll')
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
 * Retrieve a list of all peers from the rendezvous server and set the
 * this.peers variable with the result.
 */
Main.prototype.peersGetAll = function peersGetAll () {
  logger.debug('peersGetAll')
  var deferred = q.defer()

  this.peer.listAllPeers(function (peers) {
    logger.debug('Datt got peers!')

    this.peers = peers
    // TODO: replace with event emitter
    if (this.config && this.config.onPeers && typeof (this.config.onPeers) === 'function') {
      try {
        this.config.onPeers(peers)
      } catch(exc) {}
    }
    deferred.resolve()
  }.bind(this))

  return deferred.promise
}

/**
 * This function is executed both when we choose to connect to another peer, or
 * when another peer tries to connect to us. It sets up listeners for what to
 * do when data is received.
 */
Main.prototype._setupNewConnection = function _setupNewConnection (dataConnection) {
  var peerId = (dataConnection && dataConnection.peer ? dataConnection.peer : null)
  try {
    logger.debug(JSON.stringify(dataConnection, null, 4))
  } catch(exc) {}
  logger.debug('')
  if (this.config && this.config.onConnection && typeof (this.config.onConnection) === 'function') {
    try {
      this.config.onConnection(dataConnection)
    } catch(exc) {}
  }

  dataConnection.on('data', function (data) {
    logger.debug("Connection w/ '" + peerId + "' sent data:")
    try {
      logger.debug(data)
      var message = Message.fromObject(JSON.parse(data))
      this.handleReceivedMessage(message)
    } catch (exc) {}

    if (this.config && this.config.onConnectionData && typeof (this.config.onConnectionData) === 'function') {
      try {
        this.config.onConnectionData(data, dataConnection)
      } catch(exc) {}
    }
  }.bind(this))

  if (this.peers.indexOf(peerId) === -1) {
    this.peers.push(peerId)
  }
  this.connections = this.connections || {}
  this.connections[peerId] = dataConnection

  // TODO: Promise should resolve only if connection was actually successful
  return q()
}

/**
 * Authenticate with a username and password. This function is asynchronous
 * because authenticating involves cryptography, which should be run in a
 * separate process (node) or web worker (browser). That is not yet actually
 * implemented.
*/
Main.prototype.signIn = function signIn (username, password) {
  this.user = new User(username, password)
  return this.user.init().then(function () {
    if (this.user) {
      this.announceIdentity()
    }
    return this.user
  }.bind(this))
}

/**
 * Add content to the database.
 */
Main.prototype.addContent = q.promised(function addContent (content) {
  if (typeof (content) === 'string') {
    if (!this.user) {
      throw new Error('Main#addContent: user must be signed in to create new content!')
    }
    content = new Content(content, this.user.getUsername(), this.user.getAddress(), null, null, this.user.getPubKey(), this.user.sign(content))
  }

  return content.init()
    .then(function (content) {
      return this.contentStore.putContent(content)
    }.bind(this))
})

/**
 * TODO: Is this method intended to do something different than addContent?
 */
Main.prototype.pushContent = function pushContent (content) {}

/**
 * Some content will be stored locally, but more likely, most content will be
 * stored somewhere else on the network. This method will first try to find the
 * content locally, then on the network if it is not found locally.
 */
Main.prototype.getContent = function getContent (hash) {
  var deferred = q.defer()

  this.getLocalContent(hash).then(function (localContent) {
    deferred.resolve(localContent)
  }).fail(function () {
    logger.debug('failed to find content locally - trying remote')
    this.once('Received:' + hash, function (remoteContent) {
      logger.debug('Received the remote content!')
      deferred.resolve(remoteContent)
    })
    this.getRemoteContent(hash)
  }.bind(this))

  return deferred.promise
}

/**
 * Get content from the database (i.e., locally).
 */
Main.prototype.getLocalContent = function getLocalContent (hash) {
  return this.contentStore.getContent(hash)
}

/**
 * Get content from the network.
 */
Main.prototype.getRemoteContent = function getRemoteContent (hash) {
  return this.findPeersForContent(hash)
}

/**
 * Broadcast a message to our peers with a hash asking if they have a piece of
 * content.
 */
Main.prototype.askPeersForContent = function askPeersForContent (hash) {
  if (hash) {
    this.broadcastMessage(Message.contentRequestByHash(hash))
  }
}

/**
 * TODO: This appears to override the above function.
 */
Main.prototype.askPeersForContent = function askPeersForContentByUser (user) {}

/**
 * Broadcast a message telling all of our peers what user we are.
 */
Main.prototype.announceIdentity = function announceIdentity () {
  if (!this.user) {
    throw new Error('Need to be signed in to announce identity!')
  } else {
    this.broadcastMessage(this.user.serialize())
  }
}

/**
 * When we receive a message, we need to process each recevied message in a
 * different way. For instance, if a peer is asking for data, our response
 * should be first to check to see if we have that data, and if so, then to
 * respond with that data. If a peer is asking for whate peers we are connected
 * to, we should respond with a list of those peers.
 */
Main.prototype.handleReceivedMessage = function handleReceivedMessage (message) {
  var hash
  logger.debug('Got message: ' + message.serialize())
  switch (message.type) {
    case Message.Type.REQUEST_PEERS_FOR_HASH:
      logger.debug('Got peer request')
      this.handleContentDiscoveryRequest(message, this)
      break
    case Message.Type.ANNOUNCE_PEERS_FOR_HASH:
      hash = message.body.hash
      var peers = message.body.peers
      logger.debug('Got peers for hash ' + hash + ': ' + peers)
      this.handleAnnouncePeersForHash(message, this)
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
        this.emit('Received:' + hash, content)
      }.bind(this))
      break
    default:
      logger.debug('Unknown message type')
  }
}

/**
 * Send a message to all peers. Returns a promise that resolves when all
 * messages are sent. Rejects if there is an error sending to at least one
 * peer.
 */
Main.prototype.broadcastMessage = function broadcastMessage (message) {
  var p = []
  for (var peerConnectionKey in this.connections) {
    var peerConnection = this.connections[peerConnectionKey]
    p.push(q.nbind(peerConnection.send, peerConnection)(message).promise)
  }
  return q.all(p)
}

/**
 * Send a message to a particular peer (as contrasted with broadcasting a
 * messsage, which sends the same message to every peer).
 */
Main.prototype.sendMessage = function sendMessage (message, receiverId) {
  logger.debug('Sending message ' + message + ' to ' + receiverId)

  var p = []
  var peerConnection = this.connections[receiverId]
  p.push(q.nbind(peerConnection.send, peerConnection)(message).promise)
  return q.all(p)
}

/**
 * Handle message from a peer looking for hosts for a given content hash.
 * In the current implementation the node will
 * 	- forward the message to all it's peers the first time it gets it
 *	- send the requester a message announcing it has the content if it has
 *		(as of now these two must already be connected using PeerJS, in the future they must be able to connect when the node gets the request message)
 *
 * In the future this should be replaced with a DHT or similar.
 */
Main.prototype.handleContentDiscoveryRequest = function handleContentDiscoveryRequest (message) {
  var sender = message.body.sender
  var hash = message.body.hash

  // Won't forward my own messages
  if (sender === this.peer.id) {
    logger.debug('Got own message')
    return q('Own message')
  }

  if (this.seenMessages[JSON.stringify(message)]) {
    logger.debug('Already seen this message')
    return q('Already seen message. Stop propagating')
  }

  // Mark message as seen
  this.seenMessages[JSON.stringify(message)] = 1

  // Propagate message in the network
  var broadcast = this.broadcastMessage(JSON.stringify(message))

  var getAndAnnounce = this.getLocalContent(hash).then(
    // Content found
    function (content) {
      logger.debug('Has content')
      logger.debug('Need to send back to ' + sender)

      // answer requester
      var peers = []
      peers.push(this.peer.id)
      var announceMessage = Message.announcePeersForHash(hash, peers)
      return this.sendMessage(announceMessage.serialize(), sender)
    }.bind(this),
    // Content not found
    function () {
      logger.debug('Does not have content')
      return q('Did not have content')
    }
  )

  return q.all([broadcast, getAndAnnounce])
}

/**
 * When we find some peers that have a particular hash, we broadcast a message
 * to the network telling everyone which peers have that content.
 */
Main.prototype.handleAnnouncePeersForHash = function handleAnnouncePeersForHash (message) {
  var hash = message.body.hash
  var peers = message.body.peers
  logger.debug('Handling announceMessage for hash ' + hash + ' with peers ' + peers)

  if (!hash || !this.contentRequested[hash]) {
    logger.debug('Did not request this content')
    return
  }

  logger.debug('Requested this content')

  // Get content from hosts
  for (var i in peers) {
    var peer = peers[i]
    logger.debug('peer is ' + peer)
    var requestMessage = Message.contentRequestByHash(hash, this.peer.id)
    logger.debug('sending requestMessage ' + requestMessage.serialize() + ' for ' + hash + ' to ' + peer)
    this.sendMessage(requestMessage.serialize(), peer)
    break // only requesting from one peer for now
  }
}

/**
 * Broadcast a message requesting to know which peers have a piece of content.
 * We broadcast the hash of the content we are looking for in the form of a
 * "requestPeersForHash" message, expecting a response from at least one node
 * giving us a list of peers that have that content.
 */
Main.prototype.findPeersForContent = function findPeersForContent (hash) {
  var message = Message.requestPeersForHash(hash, this.peer.id)
  logger.debug('Broadcasting')
  this.broadcastMessage(message.serialize())
  this.contentRequested[hash] = 1
}

module.exports = Main
