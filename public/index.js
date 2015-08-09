function Datt(coordinationServerConfig) {
    var self = this;

    var config = $.extend({
	debug: 3,
	host: "localhost", /** default to localhost **/
	port: 9000,
	path: "/peers"
    }, coordinationServerConfig);
    this.config = coordinationServerConfig;
    this.peer = new Peer(config);
    this.peers = null;
    this.user = null;

    this.peer.on('open', function() {
	console.log("PeerJS connected!");
	if(self.config && self.config.onOpen && typeof(self.config.onOpen) === "function") {
	    self.config.onOpen();
	}
	self.getPeers();
    });

    this.getPeers = function refreshPeers() {
	self.peer.listAllPeers(function(peers) {
	    console.log("Datt got peers!");
	    self.peers = peers;
	    if(self.config && self.config.onPeers && typeof(self.config.onPeers) === "function") {
		self.config.onPeers(peers);
	    }
	});
    };

    this.peer.on('connection', function(dataConnection) {
	console.log("New connection: ");
	console.log(JSON.stringify(dataConnection, null, 4));
	console.log("");
	if(self.config && self.config.onConnection && typeof(self.config.onConnection) === "function") {
	    self.config.onConnection(dataConnection);
	}
    });

}

Datt.prototype.signIn = function signIn(user, password) {
    this.user = new User(user, password);
    return this.user;
}

Datt.prototype.pushContent = function pushContent(content) {
    
};

Datt.prototype.askPeersForContent = function askPeersForContent(content) {
    
};

Datt.prototype.announceIdentity = function announceIdentity() {
    if(!this.user) {
	throw "Need to be signed in to announce identity!";
    } else {
	this.broadcastMessage(this.user.serialize());
    }
};
Datt.prototype._connectToAvailablePeers = function _refreshConnections() {
    for(var peerKey in this.peers) {
	var peer = this.peers[peerKey];
	if(peer === this.peer.id) {
	    continue;
	}
	this.peer.connect(peer);
    }
};
Datt.prototype.broadcastMessage = function broadcastMessage(message) {
    for(var peerConnectionKey in this.peer.connections) {
	var peerConnection = this.peer.connections[peerConnectionKey][0];
	peerConnection.send(message);
    }
};


function User(username, password) {
    this.username = username;

    var hash = bitcoin.crypto.sha256(username + '_' + password);
    var d = new bigi(hash.toString("hex"));

    this.keyPair = new bitcoin.ECPair(d);
    this.address = this.keyPair.getAddress();
    this.publicKeyHex = this.keyPair.getPublicKeyBuffer().toString("hex");

    console.log("User created:");
    console.log(" '" + this.username + "' - address: " + this.address);
}
User.prototype.serialize = function serialize() {
    return this.username + "_" + this.address + "_" + this.publicKeyHex;
};
User.prototype.sign = function sign(data) {
    return this.keyPair.sign(bitcoin.crypto.sha256(data));
};

