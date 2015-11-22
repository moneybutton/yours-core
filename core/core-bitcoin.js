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
let request = require('request')
let DBBIP44Wallet = require('./db-bip44-wallet')
let Struct = require('fullnode/lib/struct')
let Constants = require('./constants')
let asink = require('asink')

// TODO: Also create and require db-bip44-wallet
function CoreBitcoin (blockchainAPIURI, db, dbbip44wallet, bip44wallet) {
  if (!(this instanceof CoreBitcoin)) {
    return new CoreBitcoin(blockchainAPIURI, db, dbbip44wallet, bip44wallet)
  }
  this.initialize()
  this.fromObject({blockchainAPIURI, db, dbbip44wallet, bip44wallet})
}

CoreBitcoin.prototype = Object.create(Struct.prototype)
CoreBitcoin.prototype.constructor = CoreBitcoin

CoreBitcoin.prototype.initialize = function () {
  this.blockchainAPIURI = Constants.blockchainAPIURI
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

CoreBitcoin.prototype.asyncGetLatestBlockInfo = function () {
  return asink(function *() { //eslint-disable-line
    let info = yield new Promise((resolve, reject) => {
      request(this.blockchainAPIURI + 'status?q=getInfo', function (error, response, body) {
        if (error || response.statusCode !== 200) {
          return reject(new Error('getting latest block info: ' + error))
        }
        resolve(body)
      })
    })
    info = JSON.parse(info)
    let height = info.info.blocks
    let blockinfo = yield new Promise((resolve, reject) => {
      request(this.blockchainAPIURI + 'block-index/' + height, function (error, response, body) {
        if (error || response.statusCode !== 200) {
          return reject(new Error('getting latest block info: ' + error))
        }
        resolve(body)
      })
    })
    blockinfo = JSON.parse(blockinfo)
    let idhex = blockinfo.blockHash
    let idbuf = new Buffer(idhex, 'hex')
    let hashbuf = BR(idbuf).readReverse()
    let hashhex = hashbuf.toString('hex')
    return {idbuf, idhex, hashbuf, hashhex, height}
  }.bind(this))
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
