/* global fullnode */
/**
 * User
 * ====
 *
 * A Datt user consists of a master key (BIP39 mnemonic, BIP32 master extended
 * private key, and BIP32 master etended public key) and a name (string, can be
 * 6 characters at minimum and 25 characters at maximum).
 *
 * The primary way to use this is to either create a new, random user:
 * let user = User().asyncFromRandom().then( ... )
 * ...then set the name:
 * user.setName('username')
 *
 * ...or to store the user:
 * let json = user.toJSON()
 * ...or retrieve it:
 * let user = User().fromJSON(json)
 */
'use strict'
let BIP32 = fullnode.BIP32
let BIP39 = fullnode.BIP39
let CryptoWorkers = require('./crypto-workers')
let Random = fullnode.Random
let Struct = fullnode.Struct
let asink = require('asink')

function User (mnemonic, masterxprv, masterxpub, name) {
  if (!(this instanceof User)) {
    return new User(mnemonic, masterxprv, masterxpub, name)
  }
  this.initialize()
  this.fromObject({mnemonic, masterxprv, masterxpub, name})
}

User.prototype = Object.create(Struct.prototype)
User.prototype.constructor = User

User.prototype.initialize = function () {
  this.name = 'satoshi'
  return this
}

/**
 * This method blocks. Do not use it in the main thread.
 */
User.prototype.fromRandom = function () {
  // 128 bits is the shortest about of entropy that can't be cracked even
  // (hypothetically) by the NSA, while also being relatively easy to
  // remember in the form of a mnemonic
  let entropybuf = Random.getRandomBuffer(128 / 8)
  let bip39 = BIP39().fromEntropy(entropybuf)
  this.mnemonic = bip39.toString()
  this.masterxprv = BIP32().fromSeed(bip39.toSeed())
  this.masterxpub = this.masterxprv.toPublic()
  this.beenSetup = false
  return this
}

/**
 * Returns a promise to this user after randomly generating a new identity,
 * i.e. a new mnemonic, masterxprv and masterxpub.
 */
User.prototype.asyncFromRandom = function () {
  return asink(function *() {
    // 128 bits is the shortest about of entropy that can't be cracked even
    // (hypothetically) by the NSA, while also being relatively easy to
    // remember in the form of a mnemonic
    let entropybuf = Random.getRandomBuffer(128 / 8)

    let obj = yield CryptoWorkers.asyncXkeysFromEntropy(entropybuf)
    this.mnemonic = obj.mnemonic
    this.masterxprv = obj.xprv
    this.masterxpub = obj.xpub
    this.beenSetup = false
    return this
  }, this)
}

User.prototype.fromJSON = function (json) {
  // TODO: We use hex here, which is faster than base58check, because it
  // doesn't involve a checksum. However, unfortunately the public keys are
  // stored compressed, and rederiving them involves elliptic curve math, which
  // is slow. We need to replace the .toHex/.fromHex with a .toJSON/.fromJSON
  // which doesn't do any elliptic curve math or other crypto. Or perhaps we
  // need additional methods no user, such as "asyncToJSON" which produces a
  // different format.
  this.mnemonic = json.mnemonic
  this.masterxprv = BIP32().fromHex(json.masterxprv)
  this.masterxpub = BIP32().fromHex(json.masterxpub)
  this.name = json.name
  this.beenSetup = json.beenSetup
  return this
}

User.prototype.toJSON = function () {
  return {
    mnemonic: this.mnemonic,
    masterxprv: this.masterxprv.toHex(),
    masterxpub: this.masterxpub.toHex(),
    name: this.name,
    beenSetup: this.beenSetup
  }
}

User.prototype.setName = function (name) {
  if (name.length < 4 || name.length > 25) {
    throw new Error('name must be greater than 3 and less than 26 characters long')
  }
  this.name = name
  return this
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

/**
 * Set flag which indicates whether user has been 'setup' yet (random users have not, for instance)
 */
User.prototype.setUserSetupFlag = function (value) {
  this.beenSetup = value
}

/**
 * Get flag which indicates whether user has been 'setup' yet
 */
User.prototype.getUserSetupFlag = function () {
  return this.beenSetup
}

module.exports = User
