/**
 * BIP44 Account
 * =============
 *
 * According to BIP44, an account is a xpub or xprv from which you can derive
 * the chain index and then address index. If you have the private key, you can
 * derive the other private keys. If you have the public key, you can only
 * derive public keys and addresses.
 */
'use strict'
let Struct = require('fullnode/lib/struct')
let CryptoWorkers = require('./crypto-workers')
let asink = require('asink')

function BIP44Account (bip32, addrindex, changeindex, keymap) {
  if (!(this instanceof BIP44Account)) {
    return new BIP44Account(bip32, addrindex, changeindex, keymap)
  }
  this.initialize()
  this.fromObject({bip32, addrindex, changeindex, keymap})
}

BIP44Account.prototype = Object.create(Struct.prototype)
BIP44Account.prototype.constructor = BIP44Account

BIP44Account.prototype.initialize = function () {
  this.keymap = new Map()
  this.addrindex = -1
  this.changeindex = -1
  return this
}

BIP44Account.prototype.asyncFromMasterXprvPrivate = function (bip32, accountindex) {
  return asink(function *() {
    if (!(accountindex >= 0 && accountindex < Math.pow(2, 31))) {
      throw new Error('accountindex must be a valid non-hardened integer greater than 0')
    }
    // TODO: Support testnet, which has a 1 for the coin type
    let path = "m/44'/0'/" + accountindex + "'"
    let keys = yield CryptoWorkers.asyncDeriveXkeysFromXprv(bip32, path)
    bip32 = keys.xprv
    this.fromObject({bip32})
    return this
  }.bind(this))
}

BIP44Account.prototype.asyncFromMasterXprvPublic = function (bip32, accountindex) {
  return asink(function *() {
    if (!(accountindex >= 0 && accountindex < Math.pow(2, 31))) {
      throw new Error('accountindex must be a valid non-hardened integer greater than 0')
    }
    // TODO: Support testnet, which has a 1 for the coin type
    let path = "m/44'/0'/" + accountindex + "'"
    let keys = yield CryptoWorkers.asyncDeriveXkeysFromXprv(bip32, path)
    bip32 = keys.xpub
    this.fromObject({bip32})
    return this
  }.bind(this))
}

BIP44Account.prototype.isPrivate = function () {
  return this.bip32.isPrivate()
}

BIP44Account.prototype.asyncDeriveKeysFromPath = function (path) {
  return asink(function *() {
    if (!path) {
      throw new Error('must specify path - see bip32 specification for format')
    }
    let keys
    keys = this.keymap.get(path)
    if (keys) {
      return keys
    }
    if (this.bip32.isPrivate()) {
      keys = yield CryptoWorkers.asyncDeriveXkeysFromXprv(this.bip32, path)
    } else {
      keys = yield CryptoWorkers.asyncDeriveXkeysFromXpub(this.bip32, path)
    }
    this.keymap.set(path, keys)
    return keys
  }.bind(this))
}

BIP44Account.prototype.asyncGetAddressKeys = function (addrindex) {
  return asink(function *() {
    let path = 'm/0/' + addrindex
    let keys = yield this.asyncDeriveKeysFromPath(path)
    return keys
  }.bind(this))
}

BIP44Account.prototype.asyncGetNextAddressKeys = function () {
  return asink(function *() {
    let addrindex = this.addrindex + 1
    let keys = yield this.asyncGetAddressKeys(addrindex)
    this.addrindex = addrindex
    return keys
  }.bind(this))
}

BIP44Account.prototype.asyncGetChangeKeys = function (changeindex) {
  return asink(function *() {
    let path = 'm/0/' + changeindex
    let keys = yield this.asyncDeriveKeysFromPath(path)
    return keys
  }.bind(this))
}

BIP44Account.prototype.asyncGetNextChangeKeys = function () {
  return asink(function *() {
    let changeindex = this.changeindex + 1
    let keys = yield this.asyncGetChangeKeys(changeindex)
    this.changeindex = changeindex
    return keys
  }.bind(this))
}

module.exports = BIP44Account
