var bitcore = require('bitcore')
var util = require('./util')
var AsyncCrypto = require('./asynccrypto')
var u = require('underscore')
var logger = require('./logger')

/**
 * A user is defined by their username and password. Note that, presently,
 * usernames are NOT unique and two different users may have the same username.
 *
 * TODO: Derive a BIP39 mnemonic for the user and then let them *set* the
 * private key. This will ensure that their identify is secure, since it would
 * be astronomically unlikely that anyone could randomly generate the same 128
 * bit mnemonic. In that case, a username is defined by their mnemnoic
 * (private) and derived extended public keys. They could choose to share one
 * particular path, such as m/100'/0, as their "identity" private key. Another
 * possibility. "Setting" a username is something that should happen once. We
 * would have to have ways to detect users that try to re-set their username
 * (then again, maybe that should be allowed).
 */
function User (username, password) {
  this.username = username
  this.password = password
}

/*
 * Initialize the user, which involves deriving a private key, public key, and
 * address. This method returns a promise that resolves after these operations
 * are complete.
 */
User.prototype.init = function () {
  logger.debug('User#init')

  if (this._readyPromise) {
    return this._readyPromise
  }

  var databuf = new Buffer(this.username + '_' + this.password, 'utf8')
  this._readyPromise = AsyncCrypto.sha256(databuf).then(function (hash) {
    var d = bitcore.crypto.BN.fromBuffer(hash)
    this.privateKey = new bitcore.PrivateKey(d)
    return AsyncCrypto.publicKeyFromPrivateKey(this.privateKey)
  }.bind(this))
  .then(function (publicKey) {
    this.publicKey = publicKey
    this.publicKeyHex = publicKey.toString('hex')
    return AsyncCrypto.addressFromPublicKey(this.publicKey)
  }.bind(this))
  .then(function (address) {
    this.address = address
  }.bind(this))

  return this._readyPromise
}

/**
 * TODO: Is this necessary? Seems to me you should just wait for init() to
 * resolve, and then you can use a user.
 */
User.prototype.then = function then (callback) {
  if (!this._readyPromise) {
    throw new Error('User instance has not been initialized; must be initialized by invoking user.init() before calling user.then(<cb>)')
  }

  var args = u.map(arguments, function (it) {
    if (typeof (it) === 'function') {
      return it.bind(this)
    } else {
      return it
    }
  }.bind(this))

  return this._readyPromise.then.apply(this._readyPromise, args)
}

/**
 * Convert the user data into a *public-facing* serialized format. The
 * serialized format does *not* include a private key, and is therefore not
 * isomorphic to the user object.
 */
User.prototype.serialize = function serialize () {
  //  return this.then(function () {
  var serialized = this.username + '_' + this.address.toString() + '_' + this.publicKeyHex
  return serialized
//  })
}

/**
 * Use the user's private key to sign some data.
 */
User.prototype.sign = function sign (data) {
  return AsyncCrypto.sha256(new Buffer(data, 'utf8'))
    .then(function (hashbuf) {
      return AsyncCrypto.sign(hashbuf, this.privateKey, 'big')
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

/**
 * Generate a random test user. TODO: Does this belong here on the public
 * facing API? It's not a big deal, but maybe this could go in utility
 * somewhere just for the tests. Then again, it may be useful to have it public
 * for, say, by-hand testing in a browser.
 */
User.randomTestUser = function randomTestUser () {
  return new User(util._randomString(5), util._randomString(5))
}

module.exports = User
