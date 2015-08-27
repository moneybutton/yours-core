var bitcore = require('bitcore')

var util = require('./util')

var AsyncCrypto = require('./asynccrypto')
var asyncCrypto = new AsyncCrypto()

var u = require('underscore')

function User (username, password) {
  this.username = username
  this.password = password
}

User.prototype.init = function () {
  console.log('User#init')
  var self = this
  var databuf = new Buffer(this.username + '_' + this.password, 'utf8')
  this._readyPromise = asyncCrypto.sha256(databuf).then((function (hash) {
    var d = bitcore.crypto.BN.fromBuffer(hash)
    this.privateKey = new bitcore.PrivateKey(d)
    return asyncCrypto.PublicKeyFromPrivateKey(this.privateKey)
  }).bind(this))
    .then((function (publicKey) {
      this.publicKey = publicKey
      this.publicKeyHex = publicKey.toString('hex')
      return asyncCrypto.AddressFromPublicKey(this.publicKey)
    }).bind(this))
    .then((function (address) {
      this.address = address
    }).bind(this))

  return this._readyPromise
}

User.prototype.then = function then (callback) {
  if (!this._readyPromise) {
    throw new Error('User instance has not been initialized; must be initialized by invoking user.init() before calling user.then(<cb>)')
  }

  var self = this
  var args = u.map(arguments, function (it) {
    if (typeof (it) === 'function') {
      return it.bind(self)
    } else {
      return it
    }
  })

  return this._readyPromise.then.apply(this._readyPromise, args)
}

User.prototype.serialize = function serialize () {
  //  return this.then(function () {
  var serialized = this.username + '_' + this.address.toString() + '_' + this.publicKeyHex
  return serialized
//  })
}

User.prototype.sign = function sign (data) {
  return asyncCrypto.sha256(new Buffer(data, 'utf8'))
    .then((function (hashbuf) {
      return asyncCrypto.sign(hashbuf, this.privateKey, 'big')
    }).bind(this))
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
