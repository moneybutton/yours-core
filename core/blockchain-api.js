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

BlockchainAPI.prototype.asyncPostRequest = function (urlquery, json) {
  return asink(function *() { //eslint-disable-line
    if (!urlquery || !json) {
      throw new Error('must specify urlquery and json for post data')
    }
    let res = yield new Promise((resolve, reject) => {
      request.post(this.blockchainAPIURI + urlquery, {form: json}, function (error, response, body) {
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

BlockchainAPI.prototype.asyncGetUTXOsJSON = function (addresses) {
  return asink(function *() {
    if (addresses.length === 0) {
      return []
    }
    let addressStrings = []
    for (let i = 0; i < addresses.length; i++) {
      let addressString = yield CryptoWorkers.asyncAddressStringFromAddress(addresses[i])
      addressStrings.push(addressString)
    }
    let UTXOsJSON = yield this.asyncPostRequest('addrs/utxo', {
      'addrs': addressStrings.join(',')
    })
    return UTXOsJSON
  }.bind(this))
}

/**
 * Returns an object containing the confirmed balance, unconfirmed balance, and
 * total balance of the addresses.
 */
BlockchainAPI.prototype.asyncGetAddressesBalancesSatoshis = function (addresses) {
  return asink(function *() {
    let json = yield this.asyncGetUTXOsJSON(addresses)
    let confirmedBalanceSatoshis = 0
    let unconfirmedBalanceSatoshis = 0
    let totalBalanceSatoshis = 0
    json.forEach(obj => {
      if (obj.confirmations > 0) {
        confirmedBalanceSatoshis += obj.amount * 1e8
      } else {
        unconfirmedBalanceSatoshis += obj.amount * 1e8
      }
      totalBalanceSatoshis += obj.amount * 1e8
    })
    return {
      confirmedBalanceSatoshis,
      unconfirmedBalanceSatoshis,
      totalBalanceSatoshis
    }
  }.bind(this))
}

/**
 * Get the balance only including transactions in blocks.
 */
BlockchainAPI.prototype.asyncGetAddressConfirmedBalanceSatoshis = function (address) {
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
BlockchainAPI.prototype.asyncGetAddressUnconfirmedBalanceSatoshis = function (address) {
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
BlockchainAPI.prototype.asyncGetAddressTotalBalanceSatoshis = function (address) {
  return asink(function *() {
    let satoshis = 0
    satoshis += yield this.asyncGetAddressConfirmedBalanceSatoshis(address)
    satoshis += yield this.asyncGetAddressUnconfirmedBalanceSatoshis(address)
    return satoshis
  }.bind(this))
}

module.exports = BlockchainAPI
