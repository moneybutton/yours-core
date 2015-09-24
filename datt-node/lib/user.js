/**
 * User
 * ====
 *
 * A Datt user consists of a master key (BIP39 mnemonic, BIP32 master extended
 * private key, and BIP32 master etended public key) and a name (string, can be
 * 6 characters at minimum and 25 characters at maximum).
 *
 * The primary way to use this is to either create a new, random user:
 * let user = User().fromRandom().then( ... )
 * ...then set the name:
 * user.setName('username')
 *
 * ...or to store the user:
 * let json = user.toJSON()
 * ...or retrieve it:
 * let user = User().fromJSON(json)
 */
'use strict'
let dependencies = {
  AsyncCrypto: require('./asynccrypto'),
  BIP32: require('fullnode/lib/bip32'),
  Random: require('fullnode/lib/random'),
  Struct: require('fullnode/lib/struct')
}

let inject = function (deps) {
  let AsyncCrypto = deps.AsyncCrypto
  let BIP32 = deps.BIP32
  let Random = deps.Random
  let Struct = deps.Struct

  function User (mnemonic, masterxprv, masterxpub, name) {
    if (!(this instanceof User)) {
      return new User(mnemonic, masterxprv, masterxpub, name)
    }
    this.initialize()
    this.fromObject({
      mnemonic: mnemonic,
      masterxprv: masterxprv,
      masterxpub: masterxpub,
      name: name
    })
  }

  User.prototype = Object.create(Struct.prototype)
  User.prototype.constructor = User

  User.prototype.initialize = function () {
    this.name = ''
    return this
  }

  /**
   * Returns a promise to this user after randomly generating a new identity,
   * i.e. a new mnemonic, masterxprv and masterxpub.
   */
  User.prototype.fromRandom = function () {
    this.name = ''
    this.mnemonic = undefined
    this.masterprv = undefined
    this.masterxpub = undefined

    // 128 bits is the shortest about of entropy that can't be cracked even
    // (hypothetically) by the NSA, while also being relatively easy to
    // remember in the form of a mnemonic
    let entropybuf = Random.getRandomBuffer(128 / 8)

    return AsyncCrypto.xkeysFromEntropy(entropybuf).then(function (obj) {
      this.mnemonic = obj.mnemonic
      this.masterxprv = obj.xprv
      this.masterxpub = obj.xpub
      return this
    }.bind(this))
  }

  User.prototype.fromJSON = function (json) {
    // TODO: We use hex here rather than base58check, which does not involve a
    // checksum, and is therefore faster because there is no crypto to block
    // IO/UI. However, that comes at the cost of subtly reduced security in the
    // case the data is corrupted. We should consider updating this to use a
    // real base58 check string, but then it must be computed in a worker.
    this.mnemonic = json.mnemonic
    this.masterxprv = BIP32().fromHex(json.masterxprv)
    this.masterxpub = BIP32().fromHex(json.masterxpub)
    this.name = json.name
    return this
  }

  User.prototype.toJSON = function () {
    return {
      mnemonic: this.mnemonic,
      masterxprv: this.masterxprv.toHex(),
      masterxpub: this.masterxpub.toHex(),
      name: this.name
    }
  }

  User.prototype.setName = function (name) {
    if (name.length < 6 || name.length >= 25) {
      throw new Error('name must be 25 characters or less')
    }
    this.name = name
  }

  /**
   * A user object may be created without having a private key - this method
   * checks to see if the three elements of the user's private key exist, which
   * are the mnemonic, masterxprv and masterxpub. Note that this method does
   * NOT check for the validity of these values; only that they are set.
   */
  User.prototype.keyIsSet = function () {
    if (this.mnemonic && this.masterxprv && this.masterxpub) {
      return true
    } else {
      return false
    }
  }

   /**
    * Checks both that the name has been set and the master key has been set.
    */
  User.prototype.isSet = function () {
    if (this.name.length > 0 && this.keyIsSet()) {
      return true
    } else {
      return false
    }
  }

  return User
}

inject = require('fullnode/lib/injector')(inject, dependencies)
let User = inject()
module.exports = User
