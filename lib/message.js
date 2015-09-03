var User = require('./user')

/**
 * A "message" is a message on the datt p2p protocol. It consists of both a
 * message type, which conveys its meaning and how to interpret the message,
 * and its body. The types can be things such as "cotnent" or announcing
 * identity.
 */
function Message (type, body) {
  this.type = type
  this.body = body
}

Message.PROTOCOL_VERSION = 0
Message.Type = {}
Message.Type.ANNOUNCE_IDENTITY = 1
Message.Type.ANNOUNCE_CONTENT = 2
Message.Type.REQUEST_CONTENT_BY_HASH = 3
Message.Type.REQUEST_CONTENT_BY_FIELDS = 4
Message.Type.REQUEST_PEERS_FOR_HASH = 5
Message.Type.ANNOUNCE_PEERS_FOR_HASH = 6
Message.Type.CONTENT = 7

/**
 * Convert the message into a standard serialized format. TODO: This should
 * really be a binary format for speed. We should use something like the
 * BufferReader/BufferWriter of fullnode to read/write such binary messages.
 */
Message.prototype.serialize = function serialize () {
  return JSON.stringify(this)
}

/**
 * Static convenience method for serializing a message that uses the prototype
 * method under the hood.
 */
Message.serialize = function serialize (message) {
  if (!message || !(message instanceof Message) || !message.serialize) {
    throw new Error('Message.serialize cannot serialize this object')
  } else {
    return message.serialize()
  }
}

/**
 * Given an object with properties "type" and "body", convert it into a
 * Message.
 */
Message.fromObject = function fromObject (object) {
  if (object.type && object.body) {
    return new Message(object.type, object.body)
  } else {
    throw new Error('Could not create Message from object' + object)
  }
}

/**
 * Create an identity announcement message from a user, for announcing your
 * identity.
 */
Message.getIdentityAnnouncementForUser = function getIdentityAnnouncementForUser (user) {
  if (!user || !(user instanceof User)) {
    throw new Error('Message.getIdentityAnnouncementForUser requires a non-null User instance for its first argument!')
  }
  return new Message(Message.Type.ANNOUNCE_IDENTITY, user.serialize())
}

/**
 * Get content announcement, for announcing that you have a piece of content
 * that other users may want.
 */
Message.getContentAnnouncement = function getContentAnnouncement (content) {
  return new Message(Message.Type.ANNOUNCE_CONTENT, content)
}

/**
 * Message to request a content by its hash.
 */
Message.contentRequestByHash = function contentRequestByHash (hash, senderId) {
  var body = {}
  body.hash = hash
  body.sender = senderId

  return new Message(Message.Type.REQUEST_CONTENT_BY_HASH, body)
}

/**
 * Request a content by "fields", for instance, requesting the content for a
 * particular user.
 */
Message.contentRequestByFields = function contentRequestByFields (contentMatchObject) {
  return new Message(Message.Type.REQUEST_CONTENT_BY_FIELDS, contentMatchObject)
}

/**
 * Request the peers that have the content of a certain hash.
 */
Message.requestPeersForHash = function requestPeersForHash (hash, senderId) {
  var body = {}
  body.hash = hash
  body.sender = senderId

  return new Message(Message.Type.REQUEST_PEERS_FOR_HASH, body)
}

/**
 * What peers have a particular hash
 */
Message.announcePeersForHash = function announcePeersForHash (hash, peers) {
  var body = {}
  body.hash = hash
  body.peers = peers

  return new Message(Message.Type.ANNOUNCE_PEERS_FOR_HASH, body)
}

/**
 * For sending content, such as a comment.
 */
Message.content = function content (hash, content) {
  var body = {}
  body.hash = hash
  body.content = content

  return new Message(Message.Type.CONTENT, body)
}

module.exports = Message
