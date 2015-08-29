var q = require('q')
var Message = require('./message')

function ContentDiscovery() {
	this.seenMessages = {}
}

/**
 * Handle message from a peer looking for hosts for a given content hash.
 * In the current implementation the node will 
 * 	- forward the message to all it's peers the first time it gets it
 *	- send the requester a message announcing it has the content if it has
 */
ContentDiscovery.prototype.handleContentDiscoveryRequest = function handleContentDiscoveryRequest(message, datt) {
	var sender = message.body.sender
	var hash = message.body.hash

	// Won't forward my own messages
	if (sender === datt.peer.id) {
		console.log("Got own message")
		return q("Own message")
	}

	if (this.seenMessages[JSON.stringify(message)]) {
		console.log("Already seen this message")
		return q("Already seen message. Stop propagating")
	}

	// Mark message as seen
	this.seenMessages[JSON.stringify(message)] = 1

	// Propagate message in the network
	var broadcast = datt.broadcastMessage(JSON.stringify(message))

	var getAndAnnounce = datt.getContent(hash).then(
		// Content found
		function(content){
			console.log("Has content")

			// answer requester
			var peers = []
			peers.push(datt.peer.id)
			var announceMessage = Message.announcePeersForHash(hash, peers)
			return datt.sendMessage(announceMessage.serialize(), sender)
		}, 
		// Content not found
		function(){
			console.log("Does not have content")
			return q("Did not have content")
		}
	)

	return q.all([broadcast, getAndAnnounce])
}

module.exports = ContentDiscovery