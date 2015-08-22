var bitcore = require('bitcore')

var util = require('./util')

var AsyncCrypto = require('./asynccrypto')
var asyncCrypto = new AsyncCrypto()


function User (username, password) {
  this.username = username
  this.password = password
}



User.prototype.init = function () {
  var databuf = new Buffer(this.username + '_' + this.password, 'utf8')
  return asyncCrypto.sha256(databuf).then(function (hash) {
    var d = bitcore.crypto.BN.fromBuffer(hash)
    this.privateKey = new bitcore.PrivateKey(d)
    return asyncCrypto.PublicKeyFromPrivateKey(this.privateKey)
  }.bind(this))
  .then(function (publicKey) {
    this.publicKey = publicKey
    this.publicKeyHex = publicKey.toString('hex')
    return asyncCrypto.AddressFromPublicKey(this.publicKey)
  }.bind(this))
  .then(function (address) {
    this.address = address
  }.bind(this))
}

User.prototype.serialize = function serialize () {
  return this.username + '_' + this.address.toString() + '_' + this.publicKeyHex
}

User.prototype.sign = function sign (data) {
  return asyncCrypto.sha256(new Buffer(data, 'utf8'))
  .then(function (hashbuf) {
    return asyncCrypto.sign(hashbuf, this.privateKey, 'big')
  }.bind(this))
}

User.prototype.getUsername = function getUsername () {
  return this.username
}

User.prototype.getAddress = function getAddress () {
  return this.address.toString()
}

User.prototype.getPubKey = function getPubKey () {
  return this.publicKeyHex
}

User.randomTestUser = function randomTestUser () {
  return new User(util._randomString(5), util._randomString(5))
}

module.exports = User
