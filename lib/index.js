/* global Fullnode */
/**
 * YoursCore
 * =========
 *
 * This is the entry point into the YoursCore application. The way to use it is
 * like this:
 *
 * let config = { [insert config here] }
 * let yourscore = YoursCore.create(config)
 * // yourscore now exists, and you need to initialize it:
 * return yourscore.asyncInitialize().then( [handle yourscore after it is initialized] )
 *
 * A word on architecture of this file: This file, yourscore, is intended to be a
 * window into the p2p connections and database. The only logic in the methods
 * in this file should be things that combine multiple different elemements,
 * such as the database, blockchain API, and user, all in one method.
 * Otherwise, it should just link to methods contained in CoreBitcoin,
 * CoreContent, etc.
 */
'use strict'
let ContentAuth = require('./contentauth')
let CoreBitcoin = require('./corebitcoin')
let CoreContent = require('./corecontent')
let CoreUser = require('./coreuser')
let DB = require('./db')
let DBContentAuth = require('./dbcontentauth')
let EventEmitter = require('events')
let Struct = Fullnode.Struct
let User = require('./user')
let asink = require('asink')
let pkg = require('../package')

function YoursCore (config, db, corebitcoin, corecontent, coreuser, isinitialized) {
  if (!(this instanceof YoursCore)) {
    return new YoursCore(config, db, corebitcoin, corecontent, coreuser, isinitialized)
  }
  this.initialize()
  this.fromObject({config, db, corebitcoin, corecontent, coreuser, isinitialized})
}

YoursCore.prototype = Object.create(Struct.prototype)
YoursCore.prototype.constructor = YoursCore
Object.assign(YoursCore.prototype, EventEmitter.prototype)

YoursCore.Fullnode = Fullnode
YoursCore.ContentAuth = ContentAuth
YoursCore.CoreBitcoin = CoreBitcoin
YoursCore.CoreContent = CoreContent
YoursCore.CoreUser = CoreUser
YoursCore.DB = DB
YoursCore.DBContentAuth = DBContentAuth
YoursCore.User = User
YoursCore.prototype.version = pkg.version

/**
 * Synchronous initialization to set default values.
 */
YoursCore.prototype.initialize = function () {
  this.config = {}
  this.isinitialized = false // Only set to true after asyncInitialize
  return this
}

/**
 * Asynchronous initialization method to prepare the database and network
 * connections. Run this to turn yourscore on.
 */
YoursCore.prototype.asyncInitialize = function (opts) {
  return asink(function *() {
    let defaultOpts = {
      bitcoin: true
    }
    opts = Object.assign(defaultOpts, opts)

    if (!this.db) {
      let name = this.config.dbName
      let basePath = this.config.dbBasePath
      this.db = DB(name, basePath)
    }

    this.corebitcoin = CoreBitcoin(this.config.blockchainAPIURI, this.db)
    this.corecontent = CoreContent(this.db)
    this.coreuser = CoreUser(this.db)

    this.monitorCoreBitcoin()
    this.monitorCoreContent()

    yield this.db.asyncInitialize()
    yield this.coreuser.asyncInitialize()
    yield this.corebitcoin.asyncInitialize(this.coreuser.user)
    if (opts.bitcoin) {
      this.corebitcoin.monitorBlockchainAPI()
      yield this.corebitcoin.asyncUpdateBalance()
    }

    this.isinitialized = true
    this.emit('initialized')

    return Promise.resolve()
  }, this)
}

YoursCore.prototype.close = function () {
  return this.db.close()
}

/**
 * Create a new yourscore.
 */
YoursCore.create = function (config) {
  let yourscore = YoursCore(config)
  return yourscore
}

/**
 * Get cached global yourscore, or else make a new one. Note that the config is only
 * used if a new yourscoreneeds to be created.
 */
YoursCore.getGlobal = function (config) {
  if (global.yourscore) {
    return global.yourscore
  } else {
    let yourscore = YoursCore.create(config)
    global.yourscore = yourscore
    return yourscore
  }
}

/**
 * User
 * ----
 */

YoursCore.prototype.asyncSetUserName = function (name) {
  return asink(function *() {
    let info = yield this.asyncGetLatestBlockInfo()
    let blockhashbuf = info.hashbuf
    let blockheightnum = info.blockheightnum
    yield this.coreuser.asyncSetName(name)
    let msgauth = yield this.coreuser.asyncGetDMsgAuth(blockhashbuf, blockheightnum)
    yield DBContentAuth(this.db, msgauth.contentauth).asyncSave()
    return this
  }, this)
}

YoursCore.prototype.asyncGetUserName = function () {
  return Promise.resolve(this.coreuser.user.name)
}

YoursCore.prototype.asyncGetUser = function () {
  return Promise.resolve(this.coreuser.user)
}

YoursCore.prototype.asyncGetUserSetupFlag = function () {
  return Promise.resolve(this.coreuser.user.getUserSetupFlag())
}

YoursCore.prototype.asyncSetUserSetupFlag = function (value) {
  return this.coreuser.asyncSetUserSetupFlag(value)
}

YoursCore.prototype.asyncGetUserMnemonic = function () {
  return Promise.resolve(this.coreuser.user.mnemonic)
}

/**
 * Bitcoin
 * -------
 */

/**
 * This convenience method is here primarily to iterate towards a prototype as
 * fast as possible. Normally, you probably don't want to build, sign and send
 * a transaction all in one go, because this provides no opportunity for user
 * freedback along the way. For instance, what if the user belieeves the
 * automatically calculated fees are excessive, and they wish not to actually
 * send the transaction? The UI should have a step after building, but before
 * signing and sending. But, like most prototype things, it's good enough for
 * now, and we can break it up later, and then remove this method.
 *
 * paymentDescriptions is a list of "payment descriptions", where each payment
 * description is a combination of an address and an amount in satoshis. For
 * instance, a description might be:
 *
 * {toAddress: address, toAmountSatoshis: 5000}
 */
YoursCore.prototype.asyncBuildSignAndSendTransaction = function (paymentDescriptions) {
  return this.corebitcoin.asyncBuildSignAndSendTransaction(paymentDescriptions)
}

YoursCore.prototype.monitorCoreBitcoin = function () {
  this.corebitcoin.on('balance', this.handleBitcoinBalance.bind(this))
  return this
}

YoursCore.prototype.handleBitcoinBalance = function (obj) {
  this.emit('bitcoin-balance', obj)
  return this
}

YoursCore.prototype.asyncUpdateBalance = function () {
  return this.corebitcoin.asyncUpdateBalance(true)
}

YoursCore.prototype.asyncGetBlockchainPayerAddresses = function (address) {
  return this.corebitcoin.asyncGetBlockchainPayerAddresses(address)
}

YoursCore.prototype.asyncGetAddressesBalancesSatoshis = function (addresses) {
  return this.corebitcoin.asyncGetAddressesBalancesSatoshis(addresses)
}

/**
 * Return information about the latest block, including the id and height.
 * TODO: Make this actually return the latest block info instead of a
 * pre-programmed value.
 */
YoursCore.prototype.asyncGetLatestBlockInfo = function () {
  return this.corebitcoin.asyncGetLatestBlockInfo()
}

YoursCore.prototype.asyncGetExtAddress = function (index) {
  return this.corebitcoin.asyncGetExtAddress(index)
}

YoursCore.prototype.asyncGetNewExtAddress = function () {
  return this.corebitcoin.asyncGetNewExtAddress()
}

YoursCore.prototype.asyncGetNewIntAddress = function () {
  return this.corebitcoin.asyncGetNewIntAddress()
}

/**
 * Content
 * -------
 */

YoursCore.prototype.monitorCoreContent = function () {
  this.corecontent.on('contentauth', this.handleContentContentAuth.bind(this))
  return this
}

YoursCore.prototype.handleContentContentAuth = function (contentauth) {
  this.emit('content-contentauth', contentauth)
  return this
}

/**
 * Creates new ContentAuth, but does not save it.
 */
YoursCore.prototype.asyncNewContentAuth = function (title, label, body) {
  return asink(function *() {
    // TODO: Should not use the user's master key for the address. We should
    // generate a new address for each new use. That is something that can be
    // done by either CoreUser or CoreBitcoin.
    let privkey = this.coreuser.user.masterxprv.privkey
    let pubkey = this.coreuser.user.masterxprv.pubkey
    let address = yield this.asyncGetNewExtAddress()
    let info = yield this.asyncGetLatestBlockInfo()
    let blockhashbuf = info.hashbuf
    let blockheightnum = info.height
    let name = this.coreuser.user.name
    return this.corecontent.asyncNewContentAuth(pubkey, privkey, address, name, label, title, body, blockhashbuf, blockheightnum)
  }, this)
}

/**
 * Post new content auth. This saves the contentauth to the DB.
 */
YoursCore.prototype.asyncPostContentAuth = function (contentauth) {
  return this.corecontent.asyncPostContentAuth(contentauth)
}

/**
 * The simplest way to post new data.
 */
YoursCore.prototype.asyncPostNewContentAuth = function (title, label, body) {
  return asink(function *() {
    let contentauth = yield this.asyncNewContentAuth(title, label, body)
    return this.asyncPostContentAuth(contentauth)
  }, this)
}

/**
 * The idea is for this method to display recent data - and in the future it
 * will take arguments to query, say, recent data under a particular label, and
 * also get, say, the second "page" of results
 */
YoursCore.prototype.asyncGetRecentContentAuth = function () {
  return this.corecontent.asyncGetRecentContentAuth()
}

/**
 * Get content sorted in descending order by how much it has been tipped. Note
 * that this does not get "all time" hot content - only recent content.
 */
YoursCore.prototype.asyncGetHotContentAuth = function () {
  return asink(function *() {
    let contentauths = yield this.corecontent.asyncGetRecentContentAuth()
    let addresses = contentauths.map((contentauth) => contentauth.address)
    let balances = yield this.corebitcoin.asyncGetAddressesIndividualBalancesSatoshis(addresses)
    let objs = contentauths.map((contentauth, index) => {
      return {contentauth, balances: balances[index]}
    })
    objs = objs.sort((a, b) => b.balances.totalBalanceSatoshis - a.balances.totalBalanceSatoshis)
    return objs.map((obj) => obj.contentauth)
  }, this)
}

/**
 * Given the hashbuf of a piece of content, return that particular value (if it
 * exists in the local database).
 */
YoursCore.prototype.asyncGetContentAuth = function (hashbuf) {
  return this.corecontent.asyncGetContentAuth(hashbuf)
}

module.exports = YoursCore
global.YoursCore = YoursCore
