/**
 * CoreBitcoin
 * ===========
 *
 * A window into bitcoin functionality. This class should not contain most
 * actualy logic, but should hook together logic about unspents with logic
 * about the blockchain, as well as peer connections necessary for this
 * information. For instance, there will probably be a blockchain object that
 * connects to a blockchain service. That object will be managed by this
 * object.
 */
'use strict'
let BIP44Wallet = require('./bip44-wallet')
let BR = require('fullnode/lib/br')
let Struct = require('fullnode/lib/struct')
let asink = require('asink')

// TODO: Also create and require db-bip44-wallet
function CoreBitcoin (db, bip44wallet) {
  if (!(this instanceof CoreBitcoin)) {
    return new CoreBitcoin(db, bip44wallet)
  }
  this.fromObject({db, bip44wallet})
}

CoreBitcoin.prototype = Object.create(Struct.prototype)
CoreBitcoin.prototype.constructor = CoreBitcoin

CoreBitcoin.prototype.asyncFromRandom = function () {
  return asink(function *() {
    this.bip44wallet = yield BIP44Wallet().asyncFromRandom()
    return this
  }.bind(this))
}

CoreBitcoin.prototype.fromUser = function (user) {
  let bip44wallet = BIP44Wallet(user.mnemonic, user.masterxprv, user.masterxpub)
  this.bip44wallet = bip44wallet
  return this
}

CoreBitcoin.prototype.asyncGetLatestBlockInfo = function () {
  let idhex = '000000000000000010bf939fcce01f8f896d107febe519de2ebc75a4a29fef11'
  let idbuf = new Buffer(idhex, 'hex')
  let hashbuf = BR(idbuf).readReverse()
  let hashhex = hashbuf.toString('hex')
  let height = 376894
  return Promise.resolve({idbuf, idhex, hashbuf, hashhex, height})
}

CoreBitcoin.prototype.asyncGetNewAddress = function () {
  return asink(function *() {
    let address = yield this.bip44wallet.asyncGetNewAddress(0)
    // TODO: Save wallet to db at this point
    return address
  }.bind(this))
}

CoreBitcoin.prototype.asyncGetNewChangeAddress = function () {
  return asink(function *() {
    let address = yield this.bip44wallet.asyncGetNewChangeAddress(0)
    // TODO: Save wallet to db at this point
    return address
  }.bind(this))
}

module.exports = CoreBitcoin
