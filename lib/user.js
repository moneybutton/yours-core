var bitcore = require('bitcore')
var util = require('./util')

function User (username, password) {
  this.username = username
  this.password = password

  var hash = bitcore.crypto.Hash.sha256(new Buffer(username + '_' + password, 'utf8'))
  var d = bitcore.crypto.BN.fromBuffer(hash)

  this.privateKey = new bitcore.PrivateKey(d)
  this.address = this.privateKey.toAddress()
  this.publicKeyHex = this.privateKey.toPublicKey().toString('hex')
}

User.prototype.serialize = function serialize () {
  return this.username + '_' + this.address.toString() + '_' + this.publicKeyHex
}

User.prototype.sign = function sign (data) {
  var hash = bitcore.crypto.Hash.sha256(new Buffer(data, 'utf8'))
  return bitcore.crypto.ECDSA.sign(hash, this.privateKey, 'big')
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
