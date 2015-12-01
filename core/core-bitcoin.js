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
let BlockchainAPI = require('./blockchain-api')
let BIP44Wallet = require('./bip44-wallet')
let User = require('./user')
let DBBIP44Wallet = require('./db-bip44-wallet')
let Struct = require('fullnode/lib/struct')
let asink = require('asink')

// TODO: Also create and require db-bip44-wallet
function CoreBitcoin (blockchainAPIURI, db, dbbip44wallet, bip44wallet, blockchainAPI) {
  if (!(this instanceof CoreBitcoin)) {
    return new CoreBitcoin(blockchainAPIURI, db, dbbip44wallet, bip44wallet, blockchainAPI)
  }
  this.fromObject({blockchainAPIURI, db, dbbip44wallet, bip44wallet, blockchainAPI})
  if (!blockchainAPI) {
    this.blockchainAPI = BlockchainAPI(this.blockchainAPIURI)
  }
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
  return this.blockchainAPI.asyncGetLatestBlockInfo()
}

CoreBitcoin.prototype.asyncGetAllExtAddresses = function (index) {
  return asink(function *() {
    let bip44account = yield this.bip44wallet.asyncGetPrivateAccount(index)
    return yield bip44account.asyncGetAllExtAddresses()
  }.bind(this))
}

CoreBitcoin.prototype.asyncGetExtAddress = function (index) {
  return asink(function *() {
    let address = yield this.bip44wallet.asyncGetExtAddress(0, index)
    // TODO: Shouldn't save entire database here - should just save new address
    // and keys
    yield this.dbbip44wallet.asyncSave(this.bip44wallet)
    return address
  }.bind(this))
}

CoreBitcoin.prototype.asyncGetNewExtAddress = function () {
  return asink(function *() {
    let address = yield this.bip44wallet.asyncGetNewExtAddress(0)
    // TODO: Shouldn't save entire database here - should just save new address
    // and keys
    yield this.dbbip44wallet.asyncSave(this.bip44wallet)
    return address
  }.bind(this))
}

CoreBitcoin.prototype.asyncGetAllIntAddresses = function (index) {
  return asink(function *() {
    let bip44account = yield this.bip44wallet.asyncGetPrivateAccount(index)
    return yield bip44account.asyncGetAllIntAddresses()
  }.bind(this))
}

CoreBitcoin.prototype.asyncGetNewIntAddress = function () {
  return asink(function *() {
    let address = yield this.bip44wallet.asyncGetNewIntAddress(0)
    // TODO: Shouldn't save entire database here - should just save new address
    // and keys
    yield this.dbbip44wallet.asyncSave(this.bip44wallet)
    return address
  }.bind(this))
}

module.exports = CoreBitcoin
