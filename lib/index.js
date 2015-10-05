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
 * return dattcore.init().then( [handle datt after it is initialized] )
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
let DB = require('./db')
let DBContentAuth = require('./db-content-auth')
let Struct = require('fullnode/lib/struct')
let User = require('./user')
let CoreUser = require('./core-user')
let CoreBitcoin = require('./core-bitcoin')

function DattCore (config, db, coreuser, corebitcoin) {
  if (!(this instanceof DattCore)) {
    return new DattCore(config, db, coreuser, corebitcoin)
  }
  this.initialize()
  this.fromObject({
    config: config,
    db: db,
    coreuser: coreuser
  })
}

DattCore.prototype = Object.create(Struct.prototype)
DattCore.prototype.constructor = Struct.prototype.constructor

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
DattCore.prototype.init = function () {
  if (!this.db) {
    let name = this.config.dbName
    let basePath = this.config.dbBasePath
    this.db = DB(name, basePath)
  }

  this.coreuser = CoreUser(this.db)
  this.corebitcoin = CoreBitcoin(this.db)

  return this.db.init().then(() => {
    return this.coreuser.init()
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

DattCore.AsyncCrypto = AsyncCrypto
DattCore.DB = DB
DattCore.User = User

/**
 * User
 * ====
 */

/**
 * TODO: Move all this logic to yet-to-exist core-user module and save to
 * database.
 */
DattCore.prototype.setUserName = function (name) {
  let blockhashbuf
  let blockheightnum
  return this.getLatestBlockInfo().then(info => {
    blockhashbuf = info.hashbuf
    blockheightnum = info.blockheightnum
    return this.coreuser.asyncSetName(name)
  }).then(() => {
    return this.coreuser.asyncGetMsgAuth(blockhashbuf, blockheightnum)
  }).then(msgauth => {
    return DBContentAuth(this.db, msgauth.contentauth).save()
  }).then(() => {
    // TODO: broadcast msgauth
    return this
  })
}

DattCore.prototype.getUserName = function () {
  return Promise.resolve(this.coreuser.user.name)
}

DattCore.prototype.getUserMnemonic = function () {
  return Promise.resolve(this.coreuser.user.mnemonic)
}

/**
 * Bitcoin
 * =======
 */

/**
 * Return information about the latest block, including the id and height.
 * TODO: Make this actually return the latest block info instead of a
 * pre-programmed value.
 */
DattCore.prototype.getLatestBlockInfo = function () {
  return this.corebitcoin.asyncGetLatestBlockInfo()
}

module.exports = DattCore
global.DattCore = DattCore
