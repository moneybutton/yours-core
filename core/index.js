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
    yield this.asyncInitializeDb()
    yield this.asyncInitializeCoreContent()

    yield this.asyncInitializeCoreUser()
    yield this.asyncInitializeCoreBitcoin()
    yield this.asyncInitializeCorePeers()

    this.isinitialized = true
    this.emit('initialized', this.isinitialized)
    return Promise.resolve()
  }, this)
}

DattCore.prototype.asyncInitializeDb = function () {
  return asink(function *() {
    if (!this.db) {
      let name = this.config.dbName
      let basePath = this.config.dbBasePath
      this.db = DB(name, basePath)
    }
    return this.db.asyncInitialize()
  }, this)
}

DattCore.prototype.asyncInitializeCoreBitcoin = function () {
  return asink(function *() {
    this.corebitcoin = CoreBitcoin(this.config.blockchainAPIURI, this.db)
    this.monitorCoreBitcoin()
    yield this.corebitcoin.asyncInitialize(this.coreuser.user)

    return this.corebitcoin
  }, this)
}

DattCore.prototype.asyncInitializeCoreContent = function () {
  return asink(function *() {
    this.corecontent = CoreContent(this.db)
    this.monitorCoreContent()

    return this.corecontent
  }, this)
}

DattCore.prototype.asyncInitializeCoreUser = function () {
  return asink(function *() {
    this.coreuser = CoreUser(this.db)
    yield this.coreuser.asyncInitialize()

    return this.coreuser
  }, this)
}

DattCore.prototype.asyncInitializeCorePeers = function () {
  return asink(function *() {
    this.corepeers = CorePeers({rendezvous: this.config.rendezvous}, this.db)
    this.monitorCorePeers()

    return this.corepeers
  }, this)
}

/**
 * Get a promise resolved if/when DattCore and all its dependencies are finished initializing
 */
DattCore.prototype.whenInitialized = function () {
  return new Promise(function (resolve) {
    if (this.isinitialized) {
      resolve(true)
    } else {
      this.on('initialized', function () {
        resolve(this.isinitialized)
      }.bind(this))
    }
  }.bind(this))
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

    this.asyncPostContentAuth(msgauth.contentauth)

    return this
  }, this)
}

DattCore.prototype.asyncGetUserName = function () {
  return Promise.resolve(this.coreuser.user.name)
}

DattCore.prototype.asyncGetUser = function () {
  return Promise.resolve(this.coreuser.user)
}

DattCore.prototype.asyncGetUserSetupFlag = function () {
  return Promise.resolve(this.coreuser.user.getUserSetupFlag())
}

DattCore.prototype.asyncSetUserSetupFlag = function (value) {
  return this.coreuser.asyncSetUserSetupFlag(value)
}

DattCore.prototype.asyncGetUserMnemonic = function () {
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
 * freedback along the way. For instance, what if the user believes the
 * automatically calculated fees are excessive, and they wish not to actually
 * send the transaction? The UI should have a step after building, but before
 * signing and sending. But, like most prototype things, it's good enough for
 * now, and we can break it up later, and then remove this method.
 */
DattCore.prototype.asyncBuildSignAndSendTransaction = function (toAddress, toAmountSatoshis) {
  return this.corebitcoin.asyncBuildSignAndSendTransaction(toAddress, toAmountSatoshis)
}

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
    let msgauth = MsgContentAuth().fromContentAuth(contentauth)
    return this.asyncPostMsgAuth(msgauth)
  }, this)
}

/**
 * Post new message auth. This both saves the associated contentauth to the DB
 * and broadcasts the message auth in message form to your peers.
 */
DattCore.prototype.asyncPostMsgAuth = function (msgauth) {
  return asink(function *() {
    this.broadcastMsg(msgauth.toMsg())
    return this.corecontent.asyncPostContentAuth(msgauth.contentauth)
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
 * Retrieve single piece of content by hashbuf.
 * This is the basic content retrieval method used by the single-content view.
 * Use this whenever you need a single piece of content by hash.
 */
DattCore.prototype.asyncGetContentAuth = function (hashbuf) {
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
