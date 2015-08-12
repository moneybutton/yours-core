var bitcore = require('bitcore')

function User (username, password) {
  this.username = username
  this.password = password

  var hash = bitcore.crypto.Hash.sha256(new Buffer(username + '_' + password, 'utf8'))
  var d = bitcore.crypto.BN.fromBuffer(hash)

  this.privateKey = new bitcore.PrivateKey(d)
  this.address = this.privateKey.toAddress()
  this.publicKeyHex = this.privateKey.toPublicKey().toString('hex')

  console.log('User created:')
  console.log(" '" + this.username + "' - address: " + this.address)
}

User.prototype.serialize = function serialize () {
  return this.username + '_' + this.address + '_' + this.publicKeyHex
}

User.prototype.sign = function sign (data) {
  var hash = bitcore.crypto.Hash.sha256(new Buffer(data, 'utf8'))
  return bitcore.crypto.ECDSA.sign(hash, this.privateKey, 'big')
}

module.exports = User
