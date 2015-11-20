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
let User = require('./user')
let BR = require('fullnode/lib/br')
let DBBIP44Wallet = require('./db-bip44-wallet')
let Struct = require('fullnode/lib/struct')
let asink = require('asink')

// TODO: Also create and require db-bip44-wallet
function CoreBitcoin (db, dbbip44wallet, bip44wallet) {
  if (!(this instanceof CoreBitcoin)) {
    return new CoreBitcoin(db, dbbip44wallet, bip44wallet)
  }
  this.fromObject({db, dbbip44wallet, bip44wallet})
}

CoreBitcoin.prototype = Object.create(Struct.prototype)
CoreBitcoin.prototype.constructor = CoreBitcoin

CoreBitcoin.prototype.asyncInitialize = function (user) {
  return asink(function *() {
    try {
      this.bip44wallet = yield DBBIP44Wallet(this.db).asyncGet()
    } catch (err) {
      if (err.message === 'missing') {
        if (!user) {
          user = yield User().asyncFromRandom()
        }
        this.fromUser(user)
      } else {
        throw new Error('error initializing core-bitcoin: ' + err)
      }
    }
    this.dbbip44wallet = DBBIP44Wallet(this.db, this.bip44wallet)
    return this
  }.bind(this))
}

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
    // TODO: Shouldn't save entire database here - should just save new address
    // and keys
    yield this.dbbip44wallet.asyncSave(this.bip44wallet)
    return address
  }.bind(this))
}

CoreBitcoin.prototype.asyncGetNewChangeAddress = function () {
  return asink(function *() {
    let address = yield this.bip44wallet.asyncGetNewChangeAddress(0)
    // TODO: Shouldn't save entire database here - should just save new address
    // and keys
    yield this.dbbip44wallet.asyncSave(this.bip44wallet)
    return address
  }.bind(this))
}

module.exports = CoreBitcoin
