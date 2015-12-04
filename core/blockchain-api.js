/**
 * Blockchain API
 * ==============
 *
 * This is a tool for accessing the blockchain through an API. We assume the
 * API has the same interface as BitPay's Insight, and we default to using the
 * public Insight server. This tool basically lets you get the latest block
 * info, get UTXOs, and send transactions. In the future, we will probably
 * migrate at least some features away from using an API and towards using SPV,
 * but for now this is simpler.
 */
'use strict'
let BR = require('fullnode/lib/br')
let Constants = require('./constants')
let CryptoWorkers = require('./crypto-workers')
let Struct = require('fullnode/lib/struct')
let asink = require('asink')
let request = require('request') // TODO: replace request w/ something smaller

function BlockchainAPI (blockchainAPIURI) {
  if (!(this instanceof BlockchainAPI)) {
    return new BlockchainAPI(blockchainAPIURI)
  }
  this.initialize()
  this.fromObject({blockchainAPIURI})
}

BlockchainAPI.prototype = Object.create(Struct.prototype)
BlockchainAPI.prototype.constructor = BlockchainAPI

BlockchainAPI.prototype.initialize = function () {
  this.blockchainAPIURI = Constants.blockchainAPIURI
  return this
}

BlockchainAPI.prototype.asyncGetRequest = function (urlquery) {
  return asink(function *() { //eslint-disable-line
    let res = yield new Promise((resolve, reject) => {
      request(this.blockchainAPIURI + urlquery, function (error, response, body) {
        if (error || response.statusCode !== 200) {
          return reject(new Error(`blockchain-api getting ${urlquery}: ${error}`))
        }
        resolve(body)
      })
    })
    return JSON.parse(res)
  }.bind(this))
}

BlockchainAPI.prototype.asyncGetLatestBlockInfo = function () {
  return asink(function *() {
    let info = yield this.asyncGetRequest('status?q=getInfo')
    let height = info.info.blocks
    let blockinfo = yield this.asyncGetRequest(`block-index/${height}`)
    let idhex = blockinfo.blockHash
    let idbuf = new Buffer(idhex, 'hex')
    let hashbuf = BR(idbuf).readReverse()
    let hashhex = hashbuf.toString('hex')
    return {idbuf, idhex, hashbuf, hashhex, height}
  }.bind(this))
}

/**
 * Get the balance only including transactions in blocks.
 */
BlockchainAPI.prototype.asyncGetConfirmedBalanceSatoshis = function (address) {
  return asink(function *() {
    let addressString = yield CryptoWorkers.asyncAddressStringFromAddress(address)
    let res = yield this.asyncGetRequest(`addr/${addressString}/balance`)
    let satoshis = parseInt(res, 10)
    return satoshis
  }.bind(this))
}

/**
 * Get balance only including transactions seen but not in blocks.
 */
BlockchainAPI.prototype.asyncGetUnconfirmedBalanceSatoshis = function (address) {
  return asink(function *() {
    let addressString = yield CryptoWorkers.asyncAddressStringFromAddress(address)
    let res = yield this.asyncGetRequest(`addr/${addressString}/unconfirmedBalance`)
    let satoshis = parseInt(res, 10)
    return satoshis
  }.bind(this))
}

/**
 * Get balance including both transactions in a block and transactions seen but
 * not in a block.
 */
BlockchainAPI.prototype.asyncGetTotalBalanceSatoshis = function (address) {
  return asink(function *() {
    let satoshis = 0
    satoshis += yield this.asyncGetConfirmedBalanceSatoshis(address)
    satoshis += yield this.asyncGetUnconfirmedBalanceSatoshis(address)
    return satoshis
  }.bind(this))
}

module.exports = BlockchainAPI
