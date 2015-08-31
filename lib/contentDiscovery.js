var q = require('q')
var Message = require('./message')

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
    console.log('Got own message')
    return q('Own message')
  }

  if (this.seenMessages[JSON.stringify(message)]) {
    console.log('Already seen this message')
    return q('Already seen message. Stop propagating')
  }

  // Mark message as seen
  this.seenMessages[JSON.stringify(message)] = 1

  // Propagate message in the network
  var broadcast = datt.broadcastMessage(JSON.stringify(message))

  var getAndAnnounce = datt.getContent(hash).then(
    // Content found
    function (content) {
      console.log('Has content')

      // answer requester
      var peers = []
      peers.push(datt.peer.id)
      var announceMessage = Message.announcePeersForHash(hash, peers)
      return datt.sendMessage(announceMessage.serialize(), sender)
    },
    // Content not found
    function () {
      console.log('Does not have content')
      return q('Did not have content')
    }
  )

  return q.all([broadcast, getAndAnnounce])
}

ContentDiscovery.prototype.findPeersForContent = function findPeersForContent (hash, datt) {
  var message = Message.requestPeersForHash(hash, datt)
  console.log("Broadcasting")
  datt.broadcastMessage(message.serialize())
  this.contentRequested[hash] = 1
}

ContentDiscovery.prototype.handleAnnouncePeersForHash = function handleAnnouncePeersForHash (message, datt) {
  var hash = message.body.hash
  var peers = message.body.peers 
  console.log("Handling announceMessage for hash " + hash + " with peers " + peers)

  if(!hash || !this.contentRequested[hash]) {
    console.log("Did not request this content")
    return
  }

  console.log("Requested this content")

  // Get content from hosts
  for (var i in peers) {
    var peer = peers[i]
    console.log("peer is " + peer)
    var requestMessage = Message.contentRequestByHash(hash, datt)
    console.log("sending requestMessage " + requestMessage.serialize() + " for " + hash + " to " + peer)
    datt.sendMessage(requestMessage.serialize(), peer)
    break // only requesting from one peer for now
  }
}

ContentDiscovery.prototype.findPeersForContent = function findPeersForContent (hash, datt) {
  var message = Message.requestPeersForHash(hash, datt)
  console.log("Broadcasting")
  datt.broadcastMessage(message.serialize())
  this.contentRequested[hash] = 1
}

module.exports = ContentDiscovery
