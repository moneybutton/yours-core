var User = require('./user');

function Message(type, body) {
    this.type = type;
    this.body = body;
}

Message.Type = {};
Message.Type.ANNOUNCE_IDENTITY = 1;
Message.Type.ANNOUNCE_CONTENT = 2;
Message.Type.REQUEST_CONTENT = 3;

Message.prototype.serialize = function serialize() {
    return JSON.stringify(this);
};
Message.serialize = function serialize(message) {
    if(!message || !message.serialize || typeof(message.serialize) !== "function") {
	throw "Message.serialize cannot serialize this object";
    } else {
	return message.serialize();
    }
};

Message.getIdentityAnnouncementForUser = function getIdentityAnnouncementForUser(user) {
    if(!user || !user.constructor || !user.constructor.name || user.constructor.name !== "User" || !user.serialize || typeof(user.serialize !== "function")) {
	throw "Message.getIdentityAnnouncementForUser requires a non-null User instance for its first argument!";
    }
    return new Message(Message.Type.ANNOUNCE_IDENTITY, user.serialize());
};

Message.getContentAnnouncement = function getContentAnnouncement(content) {
    
};


module.exports = Message;
