/* global Fullnode */
/**
 * Datt
 * ====
 *
 * This is the entry point into the Datt application. The way to use it is
 * like this:
 *
 * let config = { [insert config here] }
 * let datt = Datt.create(config)
 * // datt now exists, and you need to initialize it:
 * return datt.asyncInitialize().then( [handle datt after it is initialized] )
 *
 * A word on architecture of this file: This file, datt, is intended to be a
 * window into the p2p connections and database. It is NOT intended to host
 * application logic - but just provide an API to the code contained in other
 * files in lib/*.js. If the methods here have too many lines of code and
 * access the database and peers, something has gone wrong. All methods here
 * should be very simple and only access other objects/methods from other
 * files.
 */
'use strict'
let ContentAuth = require('./contentauth')
let CoreBitcoin = require('./corebitcoin')
let CoreContent = require('./corecontent')
let CorePeers = require('./corepeers')
let CoreUser = require('./coreuser')
let DB = require('./db')
let DBContentAuth = require('./dbcontentauth')
let EventEmitter = require('events')
let DMsgContentAuth = require('./dmsgcontentauth')
let Struct = Fullnode.Struct
let User = require('./user')
let asink = require('asink')
let pkg = require('../package')

function Datt (config, db, corebitcoin, corecontent, corepeers, coreuser, isinitialized) {
  if (!(this instanceof Datt)) {
    return new Datt(config, db, corebitcoin, corecontent, corepeers, coreuser, isinitialized)
  }
  this.initialize()
  this.fromObject({config, db, corebitcoin, corecontent, corepeers, coreuser, isinitialized})
}

Datt.prototype = Object.create(Struct.prototype)
Datt.prototype.constructor = Datt
Object.assign(Datt.prototype, EventEmitter.prototype)

Datt.Fullnode = Fullnode
Datt.ContentAuth = ContentAuth
Datt.CoreBitcoin = CoreBitcoin
Datt.CoreContent = CoreContent
Datt.CoreUser = CoreUser
Datt.DB = DB
Datt.DBContentAuth = DBContentAuth
Datt.User = User
Datt.prototype.version = pkg.version

/**
 * Synchronous initialization to set default values.
 */
Datt.prototype.initialize = function () {
  this.config = {}
  this.isinitialized = false // Only set to true after asyncInitialize
  return this
}

/**
 * Asynchronous initialization method to prepare the database and network
 * connections. Run this to turn datt on.
 */
Datt.prototype.asyncInitialize = function (opts) {
  return asink(function *() {
    let defaultOpts = {
      peers: true,
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
    this.corepeers = CorePeers({rendezvous: this.config.rendezvous}, this.db)

    this.monitorCoreBitcoin()
    this.monitorCoreContent()
    this.monitorCorePeers()

    yield this.db.asyncInitialize()
    yield this.coreuser.asyncInitialize()
    yield this.corebitcoin.asyncInitialize(this.coreuser.user)
    if (opts.bitcoin) {
      this.corebitcoin.monitorBlockchainAPI()
      yield this.corebitcoin.asyncUpdateBalance()
    }
    if (opts.peers) {
      yield this.corepeers.asyncInitialize()
      if (process.browser) {
        // TODO: Re-enable for node after network connections for node are
        // finished
        yield this.corepeers.asyncDiscoverAndConnect()
      }
    }

    this.isinitialized = true
    return Promise.resolve()
  }, this)
}

/**
 * Close all network connections and do not receive new network connections.
 * This applies both to p2p connections and the blockchain API.
 */
Datt.prototype.asyncNetworkClose = function () {
  return asink(function *() {
    this.corebitcoin.unmonitorBlockchainAPI()
    // TODO: Also close p2p connections.
  }, this)
}

Datt.prototype.close = function () {
  return this.db.close()
}

/**
 * Create a new datt.
 */
Datt.create = function (config) {
  let datt = Datt(config)
  return datt
}

/**
 * Get cached global datt, or else make a new one. Note that the config is only
 * used if a new dattneeds to be created.
 */
Datt.getGlobal = function (config) {
  if (global.datt) {
    return global.datt
  } else {
    let datt = Datt.create(config)
    global.datt = datt
    return datt
  }
}

/**
 * User
 * ----
 */

Datt.prototype.asyncSetUserName = function (name) {
  return asink(function *() {
    let info = yield this.asyncGetLatestBlockInfo()
    let blockhashbuf = info.hashbuf
    let blockheightnum = info.blockheightnum
    yield this.coreuser.asyncSetName(name)
    let msgauth = yield this.coreuser.asyncGetDMsgAuth(blockhashbuf, blockheightnum)
    yield DBContentAuth(this.db, msgauth.contentauth).asyncSave()
    // TODO: broadcast msgauth
    return this
  }, this)
}

Datt.prototype.asyncGetUserName = function () {
  return Promise.resolve(this.coreuser.user.name)
}

Datt.prototype.asyncGetUser = function () {
  return Promise.resolve(this.coreuser.user)
}

Datt.prototype.asyncGetUserSetupFlag = function () {
  return Promise.resolve(this.coreuser.user.getUserSetupFlag())
}

Datt.prototype.asyncSetUserSetupFlag = function (value) {
  return this.coreuser.asyncSetUserSetupFlag(value)
}

Datt.prototype.asyncGetUserMnemonic = function () {
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
 */
Datt.prototype.asyncBuildSignAndSendTransaction = function (toAddress, toAmountSatoshis) {
  return this.corebitcoin.asyncBuildSignAndSendTransaction(toAddress, toAmountSatoshis)
}

Datt.prototype.monitorCoreBitcoin = function () {
  this.corebitcoin.on('balance', this.handleBitcoinBalance.bind(this))
  return this
}

Datt.prototype.handleBitcoinBalance = function (obj) {
  this.emit('bitcoin-balance', obj)
  return this
}

Datt.prototype.asyncUpdateBalance = function () {
  return this.corebitcoin.asyncUpdateBalance(true)
}

Datt.prototype.asyncGetBlockchainPayerAddresses = function (address) {
  return this.corebitcoin.asyncGetBlockchainPayerAddresses(address)
}

/**
 * Return information about the latest block, including the id and height.
 * TODO: Make this actually return the latest block info instead of a
 * pre-programmed value.
 */
Datt.prototype.asyncGetLatestBlockInfo = function () {
  return this.corebitcoin.asyncGetLatestBlockInfo()
}

Datt.prototype.asyncGetExtAddress = function (index) {
  return this.corebitcoin.asyncGetExtAddress(index)
}

Datt.prototype.asyncGetNewExtAddress = function () {
  return this.corebitcoin.asyncGetNewExtAddress()
}

Datt.prototype.asyncGetNewIntAddress = function () {
  return this.corebitcoin.asyncGetNewIntAddress()
}

/**
 * Content
 * -------
 */

Datt.prototype.monitorCoreContent = function () {
  this.corecontent.on('contentauth', this.handleContentContentAuth.bind(this))
  return this
}

Datt.prototype.handleContentContentAuth = function (contentauth) {
  this.emit('content-contentauth', contentauth)
  return this
}

/**
 * Creates new ContentAuth, but does not save or broadcast it.
 */
Datt.prototype.asyncNewContentAuth = function (title, label, body) {
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
 * Post new content auth. This both saves the contentauth to the DB and
 * broadcasts it to your peers.
 */
Datt.prototype.asyncPostContentAuth = function (contentauth) {
  return asink(function *() {
    let msg = DMsgContentAuth().fromContentAuth(contentauth).toDMsg()
    this.broadcastDMsg(msg)
    return this.corecontent.asyncPostContentAuth(contentauth)
  }, this)
}

/**
 * The simplest way to post new data.
 */
Datt.prototype.asyncPostNewContentAuth = function (title, label, body) {
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
Datt.prototype.asyncGetRecentContentAuth = function () {
  return this.corecontent.asyncGetRecentContentAuth()
}

/**
 * Given the hashbuf of a piece of content, return that particular value (if it
 * exists in the local database).
 */
Datt.prototype.asyncGetContentAuth = function (hashbuf) {
  return this.corecontent.asyncGetContentAuth(hashbuf)
}

/**
 * Peers
 * -----
 */

/**
 * Monitor (or listen) to corepeers for events and run the appropriate methods.
 * This is executed automatically by this.asyncInitialize, and therefore you
 * should not need to run this by hand.
 */
Datt.prototype.monitorCorePeers = function () {
  this.corepeers.on('connection', this.handlePeersConnection.bind(this))
  this.corepeers.on('contentauth', this.handlePeersContentAuth.bind(this))
  return this
}

Datt.prototype.handlePeersConnection = function (obj) {
  this.emit('peers-connection', obj)
  return this
}

Datt.prototype.handlePeersContentAuth = function (obj) {
  this.emit('peers-contentauth', obj)
  return this
}

Datt.prototype.asyncNumActiveConnections = function () {
  return Promise.resolve(this.corepeers.numActiveConnections())
}

Datt.prototype.broadcastDMsg = function (msg) {
  this.corepeers.broadcastDMsg(msg)
  return this
}

module.exports = Datt
global.Datt = Datt
