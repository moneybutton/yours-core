/**
 * DattCore
 * ========
 *
 * This is the entry point into the DattCore application. The way to use it is
 * like this:
 *
 * let config = { [insert config here] }
 * let dattcore = DattCore.create(config)
 * // dattcore now exists, and you need to initialize it:
 * return dattcore.asyncInitialize().then( [handle datt after it is initialized] )
 *
 * A word on architecture of this file: This file, dattcore, is intended to be
 * a window into the p2p connections and database. It is NOT intended to host
 * application logic - but just provide an API to the code contained in other
 * files in core/*.js. If the methods here have too many lines of code and
 * access the database and peers, something has gone wrong. All methods here
 * should be very simple and only access other objects/methods from other
 * files.
 */
'use strict'
let CryptoWorkers = require('./crypto-workers')
let CoreBitcoin = require('./core-bitcoin')
let CoreContent = require('./core-content')
let CorePeers = require('./core-peers')
let CoreUser = require('./core-user')
let DB = require('./db')
let DBContentAuth = require('./db-content-auth')
let EventEmitter = require('events')
let MsgContentAuth = require('./msg-content-auth')
let Struct = require('fullnode/lib/struct')
let User = require('./user')
let pkg = require('../package')
let asink = require('asink')

function DattCore (config, db, corebitcoin, corecontent, corepeers, coreuser, isinitialized) {
  if (!(this instanceof DattCore)) {
    return new DattCore(config, db, corebitcoin, corecontent, corepeers, coreuser, isinitialized)
  }
  this.initialize()
  this.fromObject({config, db, corebitcoin, corecontent, corepeers, coreuser, isinitialized})
}

DattCore.prototype = Object.create(Struct.prototype)
DattCore.prototype.constructor = DattCore
Object.assign(DattCore.prototype, EventEmitter.prototype)

DattCore.CryptoWorkers = CryptoWorkers
DattCore.CoreBitcoin = CoreBitcoin
DattCore.CoreContent = CoreContent
DattCore.CoreUser = CoreUser
DattCore.DB = DB
DattCore.DBContentAuth = DBContentAuth
DattCore.User = User
DattCore.prototype.version = pkg.version

/**
 * Synchronous initialization to set default values.
 */
DattCore.prototype.initialize = function () {
  this.config = {}
  this.isinitialized = false // Only set to true after asyncInitialize
  return this
}

/**
 * Asynchronous initialization method to prepare the database and network
 * connections. Run this to turn dattcore on.
 */
DattCore.prototype.asyncInitialize = function () {
  return asink(function *() {
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

    this.isinitialized = true
    return Promise.resolve()
  }, this)
}

/**
 * Initializing network connections in a separate method than the rest of the
 * initialization because you don't want to have to wait for network
 * connections to be established before using the app. It is possible to use
 * the app without establishing network connections at all. For instance, you
 * might want to run the app offline just to backup your data.
 *
 * This applies both to p2p connections and blockchain API.
 */
DattCore.prototype.asyncNetworkInitialize = function () {
  return asink(function *() {
    this.corebitcoin.monitorBlockchainAPI()
    yield this.corebitcoin.asyncUpdateBalance()
    yield this.corepeers.asyncInitialize()
    if (process.browser) {
      // TODO: Re-enable for node after network connections for node are
      // finished
      yield this.corepeers.asyncDiscoverAndConnect()
    }
    return this
  }, this)
}

/**
 * Close all network connections and do not receive new network connections.
 * This applies both to p2p connections and the blockchain API.
 */
DattCore.prototype.asyncNetworkClose = function () {
  return asink(function *() {
    this.corebitcoin.unmonitorBlockchainAPI()
    // TODO: Also close p2p connections.
  }, this)
}

DattCore.prototype.close = function () {
  return this.db.close()
}

/**
 * Create a new dattcore.
 */
DattCore.create = function (config) {
  let dattcore = DattCore(config)
  return dattcore
}

/**
 * Get cached global dattcore, or else make a new one. Note that the config
 * is only used if a new dattcore needs to be created.
 */
DattCore.getGlobal = function (config) {
  if (global.dattcore) {
    return global.dattcore
  } else {
    let dattcore = DattCore.create(config)
    global.dattcore = dattcore
    return dattcore
  }
}

/**
 * User
 * ----
 */

DattCore.prototype.asyncSetUserName = function (name) {
  return asink(function *() {
    let info = yield this.asyncGetLatestBlockInfo()
    let blockhashbuf = info.hashbuf
    let blockheightnum = info.blockheightnum
    yield this.coreuser.asyncSetName(name)
    let msgauth = yield this.coreuser.asyncGetMsgAuth(blockhashbuf, blockheightnum)
    yield DBContentAuth(this.db, msgauth.contentauth).asyncSave()
    // TODO: broadcast msgauth
    return this
  }, this)
}

DattCore.prototype.asyncGetUserName = function () {
  return Promise.resolve(this.coreuser.user.name)
}

DattCore.prototype.asyncGetUserMnemonic = function () {
  return Promise.resolve(this.coreuser.user.mnemonic)
}

/**
 * Bitcoin
 * -------
 */

DattCore.prototype.monitorCoreBitcoin = function () {
  this.corebitcoin.on('balance', this.handleBitcoinBalance.bind(this))
  return this
}

DattCore.prototype.handleBitcoinBalance = function (obj) {
  this.emit('bitcoin-balance', obj)
  return this
}

/**
 * Return information about the latest block, including the id and height.
 * TODO: Make this actually return the latest block info instead of a
 * pre-programmed value.
 */
DattCore.prototype.asyncGetLatestBlockInfo = function () {
  return this.corebitcoin.asyncGetLatestBlockInfo()
}

DattCore.prototype.asyncGetExtAddress = function (index) {
  return this.corebitcoin.asyncGetExtAddress(index)
}

DattCore.prototype.asyncGetNewExtAddress = function () {
  return this.corebitcoin.asyncGetNewExtAddress()
}

DattCore.prototype.asyncGetNewIntAddress = function () {
  return this.corebitcoin.asyncGetNewIntAddress()
}

/**
 * Content
 * -------
 */

DattCore.prototype.monitorCoreContent = function () {
  this.corecontent.on('content-auth', this.handleContentContentAuth.bind(this))
  return this
}

DattCore.prototype.handleContentContentAuth = function (contentauth) {
  this.emit('content-content-auth', contentauth)
  return this
}

/**
 * Creates new ContentAuth, but does not save or broadcast it.
 */
DattCore.prototype.asyncNewContentAuth = function (title, label, body) {
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
DattCore.prototype.asyncPostContentAuth = function (contentauth) {
  return asink(function *() {
    let msg = MsgContentAuth().fromContentAuth(contentauth).toMsg()
    this.broadcastMsg(msg)
    return this.corecontent.asyncPostContentAuth(contentauth)
  }, this)
}

/**
 * The simplest way to post new data.
 */
DattCore.prototype.asyncPostNewContentAuth = function (title, label, body) {
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
DattCore.prototype.asyncGetRecentContentAuth = function () {
  return this.corecontent.asyncGetRecentContentAuth()
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
DattCore.prototype.monitorCorePeers = function () {
  this.corepeers.on('connection', this.handlePeersConnection.bind(this))
  this.corepeers.on('content-auth', this.handlePeersContentAuth.bind(this))
  return this
}

DattCore.prototype.handlePeersConnection = function (obj) {
  this.emit('peers-connection', obj)
  return this
}

DattCore.prototype.handlePeersContentAuth = function (obj) {
  this.emit('peers-content-auth', obj)
  return this
}

DattCore.prototype.asyncNumActiveConnections = function () {
  return Promise.resolve(this.corepeers.numActiveConnections())
}

DattCore.prototype.broadcastMsg = function (msg) {
  this.corepeers.broadcastMsg(msg)
  return this
}

module.exports = DattCore
global.DattCore = DattCore
