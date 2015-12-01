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
let Address = require('fullnode/lib/address')
let BIP32 = require('fullnode/lib/bip32')
let CryptoWorkers = require('./crypto-workers')
let Struct = require('fullnode/lib/struct')
let asink = require('asink')

function BIP44Account (bip32, extindex, intindex, keymap) {
  if (!(this instanceof BIP44Account)) {
    return new BIP44Account(bip32, extindex, intindex, keymap)
  }
  this.initialize()
  this.fromObject({bip32, extindex, intindex, keymap})
}

BIP44Account.prototype = Object.create(Struct.prototype)
BIP44Account.prototype.constructor = BIP44Account

BIP44Account.prototype.initialize = function () {
  this.keymap = new Map()
  this.extindex = -1
  this.intindex = -1
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

BIP44Account.prototype.toJSON = function () {
  let json = {}
  json.extindex = this.extindex
  json.intindex = this.intindex

  // TODO: Replace with proper non-blocking method
  json.bip32 = this.bip32.toHex()

  json.keymap = {}
  this.keymap.forEach((keys, path) => {
    json.keymap[path] = {}

    if (this.isPrivate()) {
      // TODO: Replace with proper non-blocking method
      json.keymap[path].xprv = keys.xprv.toHex()
    }

    // TODO: Replace with proper non-blocking method
    json.keymap[path].xpub = keys.xpub.toHex()

    json.keymap[path].address = keys.address.toHex()
  })

  return json
}

BIP44Account.prototype.fromJSON = function (json) {
  this.extindex = json.extindex
  this.intindex = json.intindex

  // TODO: Replace with proper non-blocking method
  this.bip32 = BIP32().fromHex(json.bip32)

  this.keymap = new Map()
  Object.keys(json.keymap).forEach((path) => {
    let keys = json.keymap[path]
    let xprv

    if (keys.xprv) {
      // TODO: Replace with proper non-blocking method
      xprv = BIP32().fromHex(keys.xprv)
    }

    // TODO: Replace with proper non-blocking method
    let xpub = BIP32().fromHex(keys.xpub)

    let address = Address().fromHex(keys.address)
    this.keymap.set(path, {xprv, xpub, address})
  })
  return this
}

BIP44Account.prototype.isPrivate = function () {
  return this.bip32.isPrivate()
}

/**
 * TODO: When deriving keys from a path, we should also create a map from
 * address to private key. This will let us easily sign transactions when we
 * know which of our addresses it is.
 */
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

/**
 * Returns all external (non-change) addresses up to extindex. This is
 * essentially all the addresses that have been gotten with
 * asyncGetAddressKeys.
 */
BIP44Account.prototype.asyncGetAllExtAddresses = function () {
  return asink(function *() {
    let addresses = []
    for (let index = 0; index <= this.extindex; index++) {
      addresses.push(yield this.asyncGetExtAddressKeys(index).address)
    }
    return addresses
  }.bind(this))
}

/**
 * Returns all internal (change) addresses up to intindex. This is all the change
 * addresses that have been gotten with asyncGetChangeKeys.
 */
BIP44Account.prototype.asyncGetAllIntAddresses = function () {
  return asink(function *() {
    let addresses = []
    for (let index = 0; index <= this.intindex; index++) {
      addresses.push(yield this.asyncGetIntAddressKeys(index).address)
    }
    return addresses
  }.bind(this))
}

/**
 * Get external (non-change) address keys.
 */
BIP44Account.prototype.asyncGetExtAddressKeys = function (extindex) {
  return asink(function *() {
    if (typeof extindex !== 'number' || extindex < 0) {
      throw new Error('invalid extindex - must be number >= 0')
    }
    let path = 'm/0/' + extindex
    let keys = yield this.asyncDeriveKeysFromPath(path)
    return keys
  }.bind(this))
}

BIP44Account.prototype.asyncGetNextExtAddressKeys = function () {
  return asink(function *() {
    let extindex = this.extindex + 1
    let keys = yield this.asyncGetExtAddressKeys(extindex)
    this.extindex = extindex
    return keys
  }.bind(this))
}

/**
 * Get internal (change) address keys.
 */
BIP44Account.prototype.asyncGetIntAddressKeys = function (intindex) {
  return asink(function *() {
    let path = 'm/1/' + intindex
    let keys = yield this.asyncDeriveKeysFromPath(path)
    return keys
  }.bind(this))
}

BIP44Account.prototype.asyncGetNextIntAddressKeys = function () {
  return asink(function *() {
    let intindex = this.intindex + 1
    let keys = yield this.asyncGetIntAddressKeys(intindex)
    this.intindex = intindex
    return keys
  }.bind(this))
}

module.exports = BIP44Account
