/* global fullnode */
/*
 * BIP44 Account
 * =============
 *
 * According to BIP44, an account is a xpub or xprv from which you can derive
 * the chain index and then address index. If you have the private key, you can
 * derive the other private keys. If you have the public key, you can only
 * derive public keys and addresses.
 */
'use strict'
let Address = fullnode.Address
let BIP32 = fullnode.BIP32
let Struct = fullnode.Struct
let asink = require('asink')

function BIP44Account (bip32, extindex, intindex, pathmap, addrhexmap) {
  if (!(this instanceof BIP44Account)) {
    return new BIP44Account(bip32, extindex, intindex, pathmap, addrhexmap)
  }
  this.initialize()
  this.fromObject({bip32, extindex, intindex, pathmap, addrhexmap})
}

BIP44Account.prototype = Object.create(Struct.prototype)
BIP44Account.prototype.constructor = BIP44Account

BIP44Account.prototype.initialize = function () {
  this.pathmap = new Map()
  this.addrhexmap = new Map()
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
    bip32 = yield bip32.asyncDerive(path)
    this.fromObject({bip32})
    return this
  }, this)
}

BIP44Account.prototype.asyncFromMasterXprvPublic = function (bip32, accountindex) {
  return asink(function *() {
    if (!(accountindex >= 0 && accountindex < Math.pow(2, 31))) {
      throw new Error('accountindex must be a valid non-hardened integer greater than 0')
    }
    // TODO: Support testnet, which has a 1 for the coin type
    let path = "m/44'/0'/" + accountindex + "'"
    bip32 = yield bip32.asyncDerive(path)
    bip32 = bip32.toPublic()
    this.fromObject({bip32})
    return this
  }, this)
}

BIP44Account.prototype.toJSON = function () {
  let json = {}
  json.extindex = this.extindex
  json.intindex = this.intindex

  // TODO: Replace with proper non-blocking method
  json.bip32 = this.bip32.toHex()

  json.pathmap = {}
  this.pathmap.forEach((keys, path) => {
    json.pathmap[path] = {}

    if (this.isPrivate()) {
      // TODO: Replace with proper non-blocking method
      json.pathmap[path].xprv = keys.xprv.toHex()
    }

    // TODO: Replace with proper non-blocking method
    json.pathmap[path].xpub = keys.xpub.toHex()

    json.pathmap[path].address = keys.address.toHex()
  })

  return json
}

BIP44Account.prototype.fromJSON = function (json) {
  this.extindex = json.extindex
  this.intindex = json.intindex

  // TODO: Replace with proper non-blocking method
  this.bip32 = BIP32().fromHex(json.bip32)

  this.pathmap = new Map()
  Object.keys(json.pathmap).forEach((path) => {
    let keys = json.pathmap[path]
    let xprv

    if (keys.xprv) {
      // TODO: Replace with proper non-blocking method
      xprv = BIP32().fromHex(keys.xprv)
    }

    // TODO: Replace with proper non-blocking method
    let xpub = BIP32().fromHex(keys.xpub)

    let address = Address().fromHex(keys.address)
    this.pathmap.set(path, {xprv, xpub, address})
  })

  // Note that addrhexmap is not directly stored in JSON - it is rederived from
  // the pathmap, which has all the information. We just have to rebuild the
  // map.
  this.addrhexmap = new Map()
  Object.keys(json.pathmap).forEach((path) => {
    let keys = json.pathmap[path]
    let xprv

    if (keys.xprv) {
      // TODO: Replace with proper non-blocking method
      xprv = BIP32().fromHex(keys.xprv)
    }

    // TODO: Replace with proper non-blocking method
    let xpub = BIP32().fromHex(keys.xpub)

    let address = Address().fromHex(keys.address)
    this.addrhexmap.set(keys.address, {xprv, xpub, address})
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
    keys = this.pathmap.get(path)
    if (keys) {
      return keys
    }
    if (this.bip32.isPrivate()) {
      let xprv = yield this.bip32.asyncDerive(path)
      let xpub = xprv.toPublic()
      let address = yield Address().asyncFromPubkey(xpub.pubkey)
      keys = {xprv, xpub, address}
    } else {
      let xpub = this.bip32.toPublic()
      let address = yield Address().asyncFromPubkey(xpub.pubkey)
      keys = {xpub, address}
    }
    this.pathmap.set(path, keys)
    this.addrhexmap.set(keys.address.toHex(), keys)
    return keys
  }, this)
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
      let keys = yield this.asyncGetExtAddressKeys(index)
      addresses.push(keys.address)
    }
    return addresses
  }, this)
}

/**
 * Returns all internal (change) addresses up to intindex. This is all the change
 * addresses that have been gotten with asyncGetChangeKeys.
 */
BIP44Account.prototype.asyncGetAllIntAddresses = function () {
  return asink(function *() {
    let addresses = []
    for (let index = 0; index <= this.intindex; index++) {
      let keys = yield this.asyncGetIntAddressKeys(index)
      addresses.push(keys.address)
    }
    return addresses
  }, this)
}

/**
 * Get external (non-change) address keys.
 */
BIP44Account.prototype.asyncGetExtAddressKeys = function (extindex) {
  return asink(function *() {
    if (typeof extindex !== 'number' || extindex < 0 || Object.is(extindex, NaN)) {
      throw new Error('invalid extindex - must be number >= 0')
    }
    let path = 'm/0/' + extindex
    let keys = yield this.asyncDeriveKeysFromPath(path)
    return keys
  }, this)
}

BIP44Account.prototype.asyncGetNextExtAddressKeys = function () {
  return asink(function *() {
    let extindex = this.extindex + 1
    let keys = yield this.asyncGetExtAddressKeys(extindex)
    this.extindex = extindex
    return keys
  }, this)
}

/**
 * Get internal (change) address keys.
 */
BIP44Account.prototype.asyncGetIntAddressKeys = function (intindex) {
  return asink(function *() {
    let path = 'm/1/' + intindex
    let keys = yield this.asyncDeriveKeysFromPath(path)
    return keys
  }, this)
}

BIP44Account.prototype.asyncGetNextIntAddressKeys = function () {
  return asink(function *() {
    let intindex = this.intindex + 1
    let keys = yield this.asyncGetIntAddressKeys(intindex)
    this.intindex = intindex
    return keys
  }, this)
}

module.exports = BIP44Account
