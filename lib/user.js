var bigi = require('bigi');
var bitcoin = require('bitcoinjs-lib');

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

module.exports = User;
