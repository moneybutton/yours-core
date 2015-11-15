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
let spawn = require('../util/spawn')

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

BIP44Account.prototype.isPrivate = function () {
  return this.bip32.isPrivate()
}

BIP44Account.prototype.asyncDeriveKeysFromPath = function (path) {
  return spawn(function *() {
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

BIP44Account.prototype.asyncGetNextAddressKeys = function () {
  return spawn(function *() {
    let addrindex = this.addrindex + 1
    let path = 'm/0/' + addrindex
    let keys = yield this.asyncDeriveKeysFromPath(path)
    this.addrindex = addrindex
    return keys
  }.bind(this))
}

BIP44Account.prototype.asyncGetNextChangeKeys = function () {
  return spawn(function *() {
    let changeindex = this.changeindex + 1
    let path = 'm/1/' + changeindex
    let keys = yield this.asyncDeriveKeysFromPath(path)
    this.changeindex = changeindex
    return keys
  }.bind(this))
}

module.exports = BIP44Account
