/**
 * BIP44 Wallet
 * ============
 *
 * An implementation of a BIP44 bitcoin wallet. This lets you plug in a master
 * xprv and derive the different "accounts" of BIP44.
 */
'use strict'
let AsyncCrypto = require('./async-crypto')
let Struct = require('fullnode/lib/struct')
let spawn = require('../util/spawn')
let Random = require('fullnode/lib/random')

function BIP44Wallet (mnemonic, masterxprv, masterxpub, bip44accounts) {
  if (!(this instanceof BIP44Wallet)) {
    return new BIP44Wallet(mnemonic, masterxprv, masterxpub, bip44accounts)
  }
  this.initialize()
  this.fromObject(mnemonic, masterxprv, masterxpub, bip44accounts)
}

BIP44Wallet.prototype = Object.create(Struct.prototype)
BIP44Wallet.prototype.constructor = BIP44Wallet

BIP44Wallet.prototype.initialize = function () {
  this.bip44accounts = []
  return this
}

BIP44Wallet.prototype.asyncFromRandom = function (entropybuf) {
  return spawn(function *() {
    if (!entropybuf) {
      entropybuf = Random.getRandomBuffer(128 / 8)
    }
    if (entropybuf.length !== 128 / 8 && entropybuf.length !== 256 / 8) {
      throw new Error('entropybuf must be 128 bits of 256 bits')
    }
    let keys = yield AsyncCrypto.xkeysFromEntropy(entropybuf)
    this.mnemonic = keys.mnemonic
    this.masterxprv = keys.xprv
    this.masterxpub = keys.xpub
    return this
  }.bind(this))
}

module.exports = BIP44Wallet
