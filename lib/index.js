/**
 * DattNode
 * ========
 *
 * This is the entry point into the DattNode application. The way to use it is
 * like this:
 *
 * let config = { [insert config here] }
 * let dattnode = DattNode.create(config)
 * // dattnode now exists, and you need to initialize it:
 * return dattnode.init().then( [handle datt after it is initialized] )
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

  function DattNode (db, user) {
    if (!(this instanceof DattNode)) {
      return new DattNode(db, user)
    }
    this.fromObject({
      db: db,
      user: user
    })
  }

  DattNode.prototype = Object.create(Struct.prototype)
  DattNode.prototype.constructor = Struct.prototype.constructor

  /**
   * Asynchronous initialization method to prepare the database and network
   * connections. Run this to turn dattnode on.
   */
  DattNode.prototype.init = function () {
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

  /**
   * Create a new dattnode while overloading the constants, i.e. configuration.
   * This is the easy way to create a new dattnode with custom configuration,
   * such as custom servers, database name, etc.
   */
  DattNode.create = function (Constants) {
    let DattNode = inject(Constants)
    let dattnode = DattNode()
    return dattnode
  }

  DattNode.AsyncCrypto = AsyncCrypto
  DattNode.DB = DB
  DattNode.User = User

  return DattNode
}

inject = require('fullnode/lib/injector')(inject, dependencies)
let DattNode = inject()
module.exports = DattNode
global.DattNode = DattNode
