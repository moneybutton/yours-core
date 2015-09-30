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
 */
'use strict'
let dependencies = {
  AsyncCrypto: require('./asynccrypto'),
  DB: require('./db'),
  Struct: require('fullnode/lib/struct'),
  User: require('./user')
}

let inject = function (deps) {
  let AsyncCrypto = deps.AsyncCrypto
  let DB = deps.DB
  let Struct = deps.Struct
  let User = deps.User

  function DattCore (db, user) {
    if (!(this instanceof DattCore)) {
      return new DattCore(db, user)
    }
    this.fromObject({
      db: db,
      user: user
    })
  }

  DattCore.prototype = Object.create(Struct.prototype)
  DattCore.prototype.constructor = Struct.prototype.constructor

  /**
   * Asynchronous initialization method to prepare the database and network
   * connections. Run this to turn dattcore on.
   */
  DattCore.prototype.init = function () {
    if (!this.db) {
      this.db = DB()
    }

    // TODO: Do not simply create a new user - check the database if a user
    // already exists, then use that. For now, we will simply generate a random
    // user for testing purposes.
    this.user = User()

    return this.user.fromRandom().then(function () {
      return this.db.init()
    }.bind(this))
  }

  DattCore.prototype.close = function () {
    return this.db.close()
  }

  /**
   * Create a new dattcore while overloading the constants, i.e. configuration.
   * This is the easy way to create a new dattcore with custom configuration,
   * such as custom servers, database name, etc.
   */
  DattCore.create = function (Constants) {
    let DattCore = inject(Constants)
    let dattcore = DattCore()
    return dattcore
  }

  DattCore.AsyncCrypto = AsyncCrypto
  DattCore.DB = DB
  DattCore.User = User

  /**
   * TODO: Save to database. That's why this function is async.
   */
  DattCore.prototype.setUserName = function (name) {
    this.user.setName(name)
    return Promise.resolve(this)
  }

  DattCore.prototype.getUserName = function () {
    return this.user.name
  }

  DattCore.prototype.getUserMnemonic = function () {
    return this.user.mnemonic
  }

  return DattCore
}

inject = require('fullnode/lib/injector')(inject, dependencies)
let DattCore = inject()
module.exports = DattCore
global.DattCore = DattCore
