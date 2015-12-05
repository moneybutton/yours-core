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
let BlockchainAPI = require('./blockchain-api')
let Constants = require('./constants')
let CryptoWorkers = require('./crypto-workers')
let DBBIP44Wallet = require('./db-bip44-wallet')
let EventEmitter = require('events')
let Struct = require('fullnode/lib/struct')
let User = require('./user')
let asink = require('asink')

// TODO: Also create and require db-bip44-wallet
function CoreBitcoin (blockchainAPIURI, db, dbbip44wallet, bip44wallet, blockchainAPI, timeoutID, balances) {
  if (!(this instanceof CoreBitcoin)) {
    return new CoreBitcoin(blockchainAPIURI, db, dbbip44wallet, bip44wallet, blockchainAPI, timeoutID, balances)
  }
  this.initialize()
  this.fromObject({blockchainAPIURI, db, dbbip44wallet, bip44wallet, blockchainAPI, timeoutID, balances})
  if (!blockchainAPI) {
    this.blockchainAPI = BlockchainAPI(this.blockchainAPIURI)
  }
}

CoreBitcoin.prototype = Object.create(Struct.prototype)
CoreBitcoin.prototype.constructor = CoreBitcoin
Object.assign(CoreBitcoin.prototype, EventEmitter.prototype)

CoreBitcoin.prototype.initialize = function () {
  this.balances = {
    confirmedBalanceSatoshis: 0,
    unconfirmedBalanceSatoshis: 0,
    totalBalanceSatoshis: 0
  }
  return this
}

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

/**
 * Initialize monitoring of the bitcoin wallet's balance by polling the
 * blockchain API. Polling is not ideal - but it is good enough for a
 * prototype. We use setTimeout rather than setInterval because there are fewer
 * sideeffects, but the basic is to just poll the blockchain API every few
 * seconds to get the latest balance of our wallet.
 */
CoreBitcoin.prototype.monitorBlockchainAPI = function () {
  this.timeoutID = setTimeout(this.asyncPollBalance.bind(this), Constants.blockchainAPIMonitorInterval)
  return this
}

/**
 * Turn off monitoring/polling.
 */
CoreBitcoin.prototype.unmonitorBlockchainAPI = function () {
  if (this.timeoutID && this.timeoutID !== 'unmonitor') {
    clearTimeout(this.timeoutID)
  }
  this.timeoutID = 'unmonitor'
  return this
}

/**
 * Update the wallet balance information by querying the blockchain API.
 */
CoreBitcoin.prototype.asyncUpdateBalance = function () {
  return asink(function *() {
    let addresses = yield this.asyncGetAllAddresses()
    let addressStrings = []
    for (let i = 0; i < addresses.length; i++) {
      addressStrings.push(yield CryptoWorkers.asyncAddressStringFromAddress(addresses[i]))
    }
    let obj = yield this.blockchainAPI.asyncGetAddressesBalancesSatoshis(addresses)
    if (obj.confirmedBalanceSatoshis !== this.balances.confirmedBalanceSatoshis ||
        obj.unconfirmedBalanceSatoshis !== this.balances.unconfirmedBalanceSatoshis ||
        obj.totalBalanceSatoshis !== this.balances.totalBalanceSatoshis) {
      this.emit('balance', obj)
    }
    this.balances = obj
  }.bind(this))
}

/**
 * This method is what's called every few seconds telling us to query the
 * blockchain API to get an updated balance.
 */
CoreBitcoin.prototype.asyncPollBalance = function () {
  return asink(function *() {
    if (this.timeoutID !== 'unmonitor') {
      yield this.asyncUpdateBalance()
      this.monitorBlockchainAPI()
    }
  }.bind(this))
}

CoreBitcoin.prototype.asyncGetLatestBlockInfo = function () {
  return this.blockchainAPI.asyncGetLatestBlockInfo()
}

/**
 * Get all addresses - both external (non-change) and internal (change). This
 * only gets addresses that were derived with the "GetNew" methods - if you
 * directly accessed an address it is not gotten. If you want to get all
 * addresses in order to find the balance of a wallet, this is what you should
 * use.
 */
CoreBitcoin.prototype.asyncGetAllAddresses = function () {
  return asink(function *() {
    let extaddresses = yield this.asyncGetAllExtAddresses()
    let intaddresses = yield this.asyncGetAllIntAddresses()
    let addresses = extaddresses.concat(intaddresses)
    return addresses
  }.bind(this))
}

/**
 * Get all external (non-change) addresses.
 */
CoreBitcoin.prototype.asyncGetAllExtAddresses = function () {
  return asink(function *() {
    let bip44account = yield this.bip44wallet.asyncGetPrivateAccount(0)
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

/**
 * Get all internal (change) addresses.
 */
CoreBitcoin.prototype.asyncGetAllIntAddresses = function () {
  return asink(function *() {
    let bip44account = yield this.bip44wallet.asyncGetPrivateAccount(0)
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
