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
 * files in lib/*.js. If the methods here have too many lines of code and
 * access the database and peers, something has gone wrong. All methods here
 * should be very simple and only access other objects/methods from other
 * files.
 */
'use strict'
let AsyncCrypto = require('./async-crypto')
let CoreBitcoin = require('./core-bitcoin')
let CoreContent = require('./core-content')
let CoreUser = require('./core-user')
let DB = require('./db')
let DBContentAuth = require('./db-content-auth')
let Struct = require('fullnode/lib/struct')
let User = require('./user')
let version = require('../package').version

function DattCore (config, db, coreuser, corebitcoin, corecontent) {
  if (!(this instanceof DattCore)) {
    return new DattCore(config, db, coreuser, corebitcoin, corecontent)
  }
  this.initialize()
  this.fromObject({config, db, coreuser, corebitcoin, corecontent})
}

DattCore.prototype = Object.create(Struct.prototype)
DattCore.prototype.constructor = Struct.prototype.constructor

DattCore.AsyncCrypto = AsyncCrypto
DattCore.CoreBitcoin = CoreBitcoin
DattCore.CoreContent = CoreContent
DattCore.CoreUser = CoreUser
DattCore.DB = DB
DattCore.DBContentAuth = DBContentAuth
DattCore.User = User
DattCore.prototype.version = version

/**
 * Synchronous initialization to set default values.
 */
DattCore.prototype.initialize = function () {
  this.config = {}
  return this
}

/**
 * Asynchronous initialization method to prepare the database and network
 * connections. Run this to turn dattcore on.
 */
DattCore.prototype.asyncInitialize = function () {
  if (!this.db) {
    let name = this.config.dbName
    let basePath = this.config.dbBasePath
    this.db = DB(name, basePath)
  }

  this.coreuser = CoreUser(this.db)
  this.corebitcoin = CoreBitcoin(this.db)
  this.corecontent = CoreContent(this.db)

  return this.db.asyncInitialize().then(() => {
    return this.coreuser.asyncInitialize()
  })
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
  let blockhashbuf
  let blockheightnum
  return this.asyncGetLatestBlockInfo().then(info => {
    blockhashbuf = info.hashbuf
    blockheightnum = info.blockheightnum
    return this.coreuser.asyncSetName(name)
  }).then(() => {
    return this.coreuser.asyncGetMsgAuth(blockhashbuf, blockheightnum)
  }).then(msgauth => {
    return DBContentAuth(this.db, msgauth.contentauth).asyncSave()
  }).then(() => {
    // TODO: broadcast msgauth
    return this
  })
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

/**
 * Return information about the latest block, including the id and height.
 * TODO: Make this actually return the latest block info instead of a
 * pre-programmed value.
 */
DattCore.prototype.asyncGetLatestBlockInfo = function () {
  return this.corebitcoin.asyncGetLatestBlockInfo()
}

/**
 * Content
 * -------
 */

/**
 * Creates new ContentAuth, but does not save or broadcast it.
 */
DattCore.prototype.asyncNewContentAuth = function (title, label, body) {
  // TODO: Should not use the user's master key for the address. We should
  // generate a new address for each new use. That is something that can be
  // done by either CoreUser or CoreBitcoin.
  let privkey = this.coreuser.user.masterxprv.privkey
  let pubkey = this.coreuser.user.masterxprv.pubkey
  let address
  return AsyncCrypto.addressFromPubkey(pubkey).then(_address => {
    address = _address
    return this.asyncGetLatestBlockInfo()
  }).then(info => {
    let blockhashbuf = info.hashbuf
    let blockheightnum = info.height
    let name = this.coreuser.user.name
    return this.corecontent.asyncNewContentAuth(pubkey, privkey, address, name, label, title, body, blockhashbuf, blockheightnum)
  })
}

/**
 * Post new content auth. TODO: Right now, this just puts the content in the
 * database, but this method should probably also broadcast the content to the
 * network.
 */
DattCore.prototype.asyncPostContentAuth = function (contentauth) {
  return this.corecontent.asyncPostContentAuth(contentauth)
}

/**
 * The simplest way to post new data.
 */
DattCore.prototype.asyncPostNewContentAuth = function (title, label, body) {
  return this.asyncNewContentAuth(title, label, body).then(contentauth => {
    return this.asyncPostContentAuth(contentauth)
  })
}

/**
 * The idea is for this method to display recent data - and in the future it
 * will take arguments to query, say, recent data under a particular label, and
 * also get, say, the second "page" of results
 */
DattCore.prototype.asyncGetRecentContentAuth = function () {
  return this.corecontent.asyncGetRecentContentAuth()
}

module.exports = DattCore
global.DattCore = DattCore
