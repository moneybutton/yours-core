/* global Fullnode */
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
let Address = Fullnode.Address
let BIP44Wallet = require('./bip44wallet')
let BN = Fullnode.BN
let BR = Fullnode.BR
let BlockchainAPI = require('./blockchainapi')
let Constants = require('./constants')
let DBBIP44Wallet = require('./dbbip44wallet')
let EventEmitter = require('events')
let Keypair = Fullnode.Keypair
let Pubkey = Fullnode.Pubkey
let Script = Fullnode.Script
let Struct = Fullnode.Struct
let Txbuilder = Fullnode.Txbuilder
let Txout = Fullnode.Txout
let User = require('./user')
let asink = require('asink')

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
  this.resetBalances()
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
        throw new Error('error initializing corebitcoin: ' + err)
      }
    }
    this.dbbip44wallet = DBBIP44Wallet(this.db, this.bip44wallet)
    return this
  }, this)
}

CoreBitcoin.prototype.resetBalances = function () {
  this.balances = {
    confirmedBalanceSatoshis: 0,
    unconfirmedBalanceSatoshis: 0,
    totalBalanceSatoshis: 0
  }
  return this
}

CoreBitcoin.prototype.asyncFromRandom = function () {
  return asink(function *() {
    this.bip44wallet = yield BIP44Wallet().asyncFromRandom()
    return this
  }, this)
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
CoreBitcoin.prototype.asyncUpdateBalance = function (forceUpdate) {
  return asink(function *() {
    let addresses = yield this.asyncGetAllAddresses()
    let addressStrings = []
    for (let i = 0; i < addresses.length; i++) {
      addressStrings.push(yield addresses[i].asyncToString())
    }
    let obj = yield this.blockchainAPI.asyncGetAddressesBalancesSatoshis(addresses)
    if (forceUpdate ||
        obj.confirmedBalanceSatoshis !== this.balances.confirmedBalanceSatoshis ||
        obj.unconfirmedBalanceSatoshis !== this.balances.unconfirmedBalanceSatoshis ||
        obj.totalBalanceSatoshis !== this.balances.totalBalanceSatoshis) {
      this.emit('balance', obj)
    }
    this.balances = obj
  }, this)
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
  }, this)
}

CoreBitcoin.prototype.asyncGetLatestBlockInfo = function () {
  return this.blockchainAPI.asyncGetLatestBlockInfo()
}

CoreBitcoin.prototype.asyncGetBlockchainPayerAddresses = function (address) {
  return this.blockchainAPI.asyncGetBlockchainPayerAddresses(address)
}

CoreBitcoin.prototype.asyncBuildTransaction = function (toAddress, toAmountSatoshis) {
  return asink(function *() {
    let txb = new Txbuilder()
    txb.setFeePerKBNum(0.0001e8) // TODO: Use more intelligent fee estimate
    let changeAddress = yield this.asyncGetNewIntAddress()
    txb.setChangeAddress(changeAddress)
    let utxos = yield this.asyncGetAllUTXOs()
    utxos.forEach((obj) => {
      txb.from(obj.txhashbuf, obj.txoutnum, obj.txout, obj.pubkey)
    })
    txb.to(BN(toAmountSatoshis), toAddress)
    txb.build()
    return txb
  }, this)
}

/**
 * txb must be a *built* Txbuilder object - that is, you must have already run
 * the .build() command, so the transaction is filled in with correct inputs
 * and outputs.
 */
CoreBitcoin.prototype.asyncSignTransaction = function (txb) {
  return asink(function *() {
    // gather the correct private key for each input
    let privkeys = []
    for (let txin of txb.tx.txins) {
      // Note: We only support signing pubkeyhash transactions
      let pubkeybuf = txin.script.chunks[1].buf
      let pubkey = yield Pubkey().asyncFromBuffer(pubkeybuf)
      let address = yield Address().asyncFromPubkey(pubkey)
      let addrhex = address.toHex()
      let bip44account = yield this.bip44wallet.asyncGetPrivateAccount(0)
      let keys = bip44account.addrhexmap.get(addrhex)
      privkeys.push(keys.xprv.privkey)
    }
    let keypairs = []
    for (let i = 0; i < privkeys.length; i++) {
      let privkey = privkeys[i]
      let pubkey = yield Pubkey().asyncFromPrivkey(privkey)
      keypairs[i] = yield Keypair(privkey, pubkey)
    }
    if (txb.txins.length !== keypairs.length) {
      throw new Error('number of inputs and number of privkeys do not match')
    }
    for (let i = 0; i < keypairs.length; i++) {
      yield txb.asyncSign(i, keypairs[i])
    }
    return txb
  }, this)
}

/**
 * txb should be a Txbuilder object.
 */
CoreBitcoin.prototype.asyncSendTransaction = function (txb) {
  return this.blockchainAPI.asyncSendTransaction(txb)
}

CoreBitcoin.prototype.asyncBuildSignAndSendTransaction = function (toAddress, toAmountSatoshis) {
  return asink(function *() {
    let txb
    txb = yield this.asyncBuildTransaction(toAddress, toAmountSatoshis)
    txb = yield this.asyncSignTransaction(txb)
    yield this.asyncSendTransaction(txb)
    return txb
  }, this)
}

CoreBitcoin.prototype.asyncGetAllUTXOs = function () {
  return asink(function *() {
    let addresses = yield this.asyncGetAllAddresses()
    let utxosjson = yield this.blockchainAPI.asyncGetUTXOsJSON(addresses)

    let utxos = []
    for (let obj of utxosjson) {
      let txhashbuf = BR(new Buffer(obj.txid, 'hex')).readReverse()
      let txoutnum = obj.vout
      let scriptPubKey = Script().fromHex(obj.scriptPubKey)
      let txout = Txout(BN(Math.floor(obj.amount * 1e8))).setScript(scriptPubKey)

      // Note we ASSUME the script PubKey is a normal pubkeyhash - we cannot
      // spend anything other than that.
      let pubkeyhashbuf = scriptPubKey.chunks[2].buf
      let address = Address().fromPubkeyHashbuf(pubkeyhashbuf)
      let bip44account = yield this.bip44wallet.asyncGetPrivateAccount(0)
      let keys = bip44account.addrhexmap.get(address.toHex())
      let xpub = keys.xpub
      let pubkey = xpub.pubkey
      utxos.push({txhashbuf, txoutnum, txout, pubkey})
    }

    return utxos
  }, this)
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
  }, this)
}

/**
 * Get all external (non-change) addresses.
 */
CoreBitcoin.prototype.asyncGetAllExtAddresses = function () {
  return asink(function *() {
    let bip44account = yield this.bip44wallet.asyncGetPrivateAccount(0)
    return yield bip44account.asyncGetAllExtAddresses()
  }, this)
}

CoreBitcoin.prototype.asyncGetExtAddress = function (index) {
  return asink(function *() {
    let address = yield this.bip44wallet.asyncGetExtAddress(0, index)
    // TODO: Shouldn't save entire database here - should just save new address
    // and keys
    yield this.dbbip44wallet.asyncSave(this.bip44wallet)
    return address
  }, this)
}

CoreBitcoin.prototype.asyncGetNewExtAddress = function () {
  return asink(function *() {
    let address = yield this.bip44wallet.asyncGetNewExtAddress(0)
    // TODO: Shouldn't save entire database here - should just save new address
    // and keys
    yield this.dbbip44wallet.asyncSave(this.bip44wallet)
    return address
  }, this)
}

/**
 * Get all internal (change) addresses.
 */
CoreBitcoin.prototype.asyncGetAllIntAddresses = function () {
  return asink(function *() {
    let bip44account = yield this.bip44wallet.asyncGetPrivateAccount(0)
    return yield bip44account.asyncGetAllIntAddresses()
  }, this)
}

CoreBitcoin.prototype.asyncGetNewIntAddress = function () {
  return asink(function *() {
    let address = yield this.bip44wallet.asyncGetNewIntAddress(0)
    // TODO: Shouldn't save entire database here - should just save new address
    // and keys
    yield this.dbbip44wallet.asyncSave(this.bip44wallet)
    return address
  }, this)
}

module.exports = CoreBitcoin
