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

Message.prototype.serialize = function serialize () {
  return JSON.stringify(this)
}

Message.serialize = function serialize (message) {
  if (!message || !message.serialize || typeof (message.serialize) !== 'function') {
    throw new Error('Message.serialize cannot serialize this object')
  } else {
    return message.serialize()
  }
}

Message.getIdentityAnnouncementForUser = function getIdentityAnnouncementForUser (user) {
  if (!user || !user.constructor || !user.constructor.name || user.constructor.name !== 'User' || !user.serialize || typeof user.serialize !== 'function') {
    throw new Error('Message.getIdentityAnnouncementForUser requires a non-null User instance for its first argument!')
  }
  return new Message(Message.Type.ANNOUNCE_IDENTITY, user.serialize())
}

Message.getContentAnnouncement = function getContentAnnouncement (content) {
  return new Message(Message.Type.ANNOUNCE_CONTENT, content)
}

Message.contentRequestByHash = function contentRequestByHash (hash) {
  return new Message(Message.Type.REQUEST_CONTENT_BY_HASH, hash)
}

Message.contentRequestByFields = function contentRequestByFields (contentMatchObject) {
  return new Message(Message.Type.REQUEST_CONTENT_BY_FIELDS, contentMatchObject)
}

module.exports = Message
