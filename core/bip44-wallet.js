/**
 * BIP44 Wallet
 * ============
 *
 * An implementation of a BIP44 bitcoin wallet. This lets you plug in a master
 * xprv and derive the different "accounts" of BIP44.
 */
'use strict'
let BIP32 = require('fullnode/lib/bip32')
let BIP44Account = require('./bip44-account')
let CryptoWorkers = require('./crypto-workers')
let Random = require('fullnode/lib/random')
let Struct = require('fullnode/lib/struct')
let asink = require('asink')

function BIP44Wallet (mnemonic, masterxprv, masterxpub, bip44accounts) {
  if (!(this instanceof BIP44Wallet)) {
    return new BIP44Wallet(mnemonic, masterxprv, masterxpub, bip44accounts)
  }
  this.initialize()
  this.fromObject({mnemonic, masterxprv, masterxpub, bip44accounts})
}

BIP44Wallet.prototype = Object.create(Struct.prototype)
BIP44Wallet.prototype.constructor = BIP44Wallet

BIP44Wallet.prototype.initialize = function () {
  this.bip44accounts = new Map()
  return this
}

BIP44Wallet.prototype.asyncFromRandom = function (entropybuf) {
  return asink(function *() {
    if (!entropybuf) {
      entropybuf = Random.getRandomBuffer(128 / 8)
    }
    if (entropybuf.length !== 128 / 8 && entropybuf.length !== 256 / 8) {
      throw new Error('entropybuf must be 128 bits of 256 bits')
    }
    let keys = yield CryptoWorkers.asyncXkeysFromEntropy(entropybuf)
    this.mnemonic = keys.mnemonic
    this.masterxprv = keys.xprv
    this.masterxpub = keys.xpub
    return this
  }.bind(this))
}

BIP44Wallet.prototype.toJSON = function () {
  let json = {}
  json.mnemonic = this.mnemonic

  // TODO: Replace with proper non-blocking method
  json.masterxprv = this.masterxprv.toHex()

  // TODO: Replace with proper non-blocking method
  json.masterxpub = this.masterxpub.toHex()

  json.bip44accounts = {}
  this.bip44accounts.forEach((bip44account, index) => {
    json.bip44accounts[index] = bip44account.toJSON()
  })

  return json
}

BIP44Wallet.prototype.fromJSON = function (json) {
  this.mnemonic = json.mnemonic

  // TODO: Replace with proper non-blocking method
  this.masterxprv = BIP32().fromHex(json.masterxprv)

  // TODO: Replace with proper non-blocking method
  this.masterxpub = BIP32().fromHex(json.masterxpub)

  this.bip44accounts = new Map()
  Object.keys(json.bip44accounts).forEach((indexstr) => {
    let bip44account = BIP44Account().fromJSON(json.bip44accounts[indexstr])
    let index = parseInt(indexstr, 10)
    this.bip44accounts.set(index, bip44account)
  })
  return this
}

BIP44Wallet.prototype.asyncGetPrivateAccount = function (index) {
  return asink(function *() {
    let account = this.bip44accounts.get(index)
    if (!account) {
      account = yield BIP44Account().asyncFromMasterXprvPrivate(this.masterxprv, index)
      this.bip44accounts.set(index, account)
    }
    return account
  }.bind(this))
}

BIP44Wallet.prototype.asyncGetAllAddresses = function (accountindex) {
  return asink(function *() {
    return this.bip44accounts.get(accountindex).asyncGetAllAddresses()
  }.bind(this))
}

BIP44Wallet.prototype.asyncGetAddress = function (accountindex, addrindex) {
  return asink(function *() {
    let account = yield this.asyncGetPrivateAccount(accountindex)
    let keys = yield account.asyncGetAddressKeys(addrindex)
    return keys.address
  }.bind(this))
}

BIP44Wallet.prototype.asyncGetNewAddress = function (accountindex) {
  return asink(function *() {
    let account = yield this.asyncGetPrivateAccount(accountindex)
    let keys = yield account.asyncGetNextAddressKeys()
    return keys.address
  }.bind(this))
}

BIP44Wallet.prototype.asyncGetAllChangeAddresses = function (accountindex) {
  return asink(function *() {
    return this.bip44accounts.get(accountindex).asyncGetAllChangeAddresses()
  }.bind(this))
}

BIP44Wallet.prototype.asyncGetNewChangeAddress = function (accountindex) {
  return asink(function *() {
    let account = yield this.asyncGetPrivateAccount(accountindex)
    let keys = yield account.asyncGetNextChangeKeys()
    return keys.address
  }.bind(this))
}

module.exports = BIP44Wallet
