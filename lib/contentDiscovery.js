var q = require('q')
var Message = require('./message')
var logger = require('./logger')

/**
 * This module manages handling a request to 'discover content', which means to
 * query our local database to see if we have the content, respond with the
 * content if we have it, and to relay the request around the network.
*/
function ContentDiscovery () {
  this.seenMessages = {}
  this.contentRequested = {}
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
ContentDiscovery.prototype.handleContentDiscoveryRequest = function handleContentDiscoveryRequest (message, datt) {
  var sender = message.body.sender
  var hash = message.body.hash

  // Won't forward my own messages
  if (sender === datt.peer.id) {
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
  var broadcast = datt.broadcastMessage(JSON.stringify(message))

  var getAndAnnounce = datt.getContent(hash).then(
    // Content found
    function (content) {
      logger.debug('Has content')

      // answer requester
      var peers = []
      peers.push(datt.peer.id)
      var announceMessage = Message.announcePeersForHash(hash, peers)
      return datt.sendMessage(announceMessage.serialize(), sender)
    },
    // Content not found
    function () {
      logger.debug('Does not have content')
      return q('Did not have content')
    }
  )

  return q.all([broadcast, getAndAnnounce])
}

/**
 * Broadcasts the requestPeersForHash message, which requests a list of peers
 * that have a hash.
 */
ContentDiscovery.prototype.findPeersForContent = function findPeersForContent (hash, datt) {
  var message = Message.requestPeersForHash(hash, datt)
  logger.debug('Broadcasting')
  datt.broadcastMessage(message.serialize())
  this.contentRequested[hash] = 1
}

/**
 * When we find some peers that have a particular hash, we broadcast a message
 * to the network telling everyone which peers have that content.
 */
ContentDiscovery.prototype.handleAnnouncePeersForHash = function handleAnnouncePeersForHash (message, datt) {
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
    var requestMessage = Message.contentRequestByHash(hash, datt)
    logger.debug('sending requestMessage ' + requestMessage.serialize() + ' for ' + hash + ' to ' + peer)
    datt.sendMessage(requestMessage.serialize(), peer)
    break // only requesting from one peer for now
  }
}

/**
 * Broadcast a message requesting to know which peers have a piece of content.
 * We broadcast the hash of the content we are looking for in the form of a
 * "requestPeersForHash" message, expecting a response from at least one node
 * giving us a list of peers that have that content.
 */
ContentDiscovery.prototype.findPeersForContent = function findPeersForContent (hash, datt) {
  var message = Message.requestPeersForHash(hash, datt)
  logger.debug('Broadcasting')
  datt.broadcastMessage(message.serialize())
  this.contentRequested[hash] = 1
}

module.exports = ContentDiscovery
