/* global fetch,Fullnode */
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
let BR = Fullnode.BR
let Constants = require('./constants')
let Struct = Fullnode.Struct
let Address = Fullnode.Address
let Script = Fullnode.Script
let Pubkey = Fullnode.Pubkey
let asink = require('asink')
require('isomorphic-fetch')

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
    if (!urlquery) {
      throw new Error('must specify urlquery')
    }
    let res = yield fetch(this.blockchainAPIURI + urlquery)
    if (res.status !== 200) {
      let error = Error(`blockchainapi posting ${urlquery}, status: ${res.status}`)
      error.body = yield res.text()
      throw error
    }
    res = yield res.text()
    return JSON.parse(res)
  }, this)
}

BlockchainAPI.prototype.asyncPostRequest = function (urlquery, json) {
  return asink(function *() { //eslint-disable-line
    if (!urlquery || !json) {
      throw new Error('must specify urlquery and json for post data')
    }
    let res = yield fetch(this.blockchainAPIURI + urlquery, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(json)
    })
    if (res.status !== 200) {
      let error = Error(`blockchainapi posting ${urlquery}, status: ${res.status}`)
      error.body = yield res.text()
      throw error
    }
    res = yield res.text()
    return JSON.parse(res)
  }, this)
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
  }, this)
}

/**
 * Note that this gets all UTXOs, including those with no confirmations.
 */
BlockchainAPI.prototype.asyncGetUTXOsJSON = function (addresses) {
  return asink(function *() {
    if (addresses.length === 0) {
      return []
    }
    let addressStrings = []
    for (let i = 0; i < addresses.length; i++) {
      let addressString = yield addresses[i].asyncToString()
      addressStrings.push(addressString)
    }

    let UTXOsJSON = yield this.asyncPostRequest('addrs/utxo', {
      'addrs': addressStrings.join(',')
    })

    return UTXOsJSON
  }, this)
}

/**
 * Note that this gets all UTXOs, including those with no confirmations.
 * uses https://github.com/bitpay/insight-api#transactions-for-multiple-addresses
 */
BlockchainAPI.prototype.asyncGetBlockchainPayerAddresses = function (address) {
  return asink(function *() {
    let addressString = yield address.asyncToString()
    let addresses = []

    let TXsJSON = yield this.asyncGetRequest('addrs/' + addressString + '/txs?from=0&to=2000')

    for (let i = 0; i < TXsJSON.items.length; i++) {
      // sometimes the api returns an undefined scriptSig
      if (TXsJSON.items[i].vin[0].scriptSig !== undefined) {
        let scriptSigHex = TXsJSON.items[i].vin[0].scriptSig.hex
        let script = Script().fromHex(scriptSigHex)
        if (script.isPubkeyhashIn()) {
          let pubKeyBuf = script.chunks[1].buf
          let pubKey = yield Pubkey().asyncFromBuffer(pubKeyBuf)
          let address = yield Address().asyncFromPubkey(pubKey)
          addresses.push(address)
        }
      }
    }

    return addresses
  }, this)
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
    json.forEach((obj) => {
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
  }, this)
}

/**
 * Get the balance only including transactions in blocks.
 */
BlockchainAPI.prototype.asyncGetAddressConfirmedBalanceSatoshis = function (address) {
  return asink(function *() {
    let addressString = yield address.asyncToString()
    let res = yield this.asyncGetRequest(`addr/${addressString}/balance`)
    let satoshis = parseInt(res, 10)
    return satoshis
  }, this)
}

/**
 * Get balance only including transactions seen but not in blocks.
 */
BlockchainAPI.prototype.asyncGetAddressUnconfirmedBalanceSatoshis = function (address) {
  return asink(function *() {
    let addressString = yield address.asyncToString()
    let res = yield this.asyncGetRequest(`addr/${addressString}/unconfirmedBalance`)
    let satoshis = parseInt(res, 10)
    return satoshis
  }, this)
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
  }, this)
}

/**
 * Send a transaction to the bitcoin network. txb must be a Txbuilder object,
 * or an object that has a "tx" property which is a Tx object.
 */
BlockchainAPI.prototype.asyncSendTransaction = function (txb) {
  return asink(function *() {
    let txhex = txb.tx.toHex()
    let res = yield this.asyncPostRequest('tx/send', {rawtx: txhex})
    let txidhex = res.txid
    return new Buffer(txidhex, 'hex')
  }, this)
}

module.exports = BlockchainAPI
