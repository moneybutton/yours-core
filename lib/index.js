/**
 * DattNode
 * ========
 *
 * This is the entry point into the DattNode application.
 */
'use strict'
let dependencies = {
  AsyncCrypto: require('./asynccrypto'),
  DB: require('./db'),
  User: require('./user')
}

let inject = function (deps) {
  let AsyncCrypto = deps.AsyncCrypto
  let DB = deps.DB
  let User = deps.User

  function DattNode (db) {
    if (!(this instanceof DattNode)) {
      return new DattNode(db)
    }
    this.db = db
  }

  /**
   * Asynchronous initialization method to prepare the database and network
   * connections. Run this to run dattnode on.
   */
  DattNode.prototype.init = function () {
    if (!this.db) {
      this.db = DB()
    }
    return this.db.init()
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
