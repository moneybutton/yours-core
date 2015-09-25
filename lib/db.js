/**
 * Database
 * ========
 *
 * For storing content and actions.
 */
'use strict'
let dependencies = {
  Constants: require('./constants').DB,
  Path: require('path'),
  PouchDB: require('pouchdb'),
  Struct: require('fullnode/lib/struct')
}

let inject = function (deps) {
  let Constants = deps.Constants
  let Path = deps.Path
  let PouchDB = deps.PouchDB
  let Struct = deps.Struct

  function DB (name, basePath, pouchdb) {
    if (!(this instanceof DB)) {
      return new DB(name, basePath, pouchdb)
    }
    this.initialize()
    this.fromObject({
      basePath: basePath,
      name: name,
      pouchdb: pouchdb
    })
  }

  DB.prototype = Object.create(Struct.prototype)
  DB.prototype.constructor = DB

  /**
   * Synchronous initialization function to set variables - you probably
   * shouldn't call this
   */
  DB.prototype.initialize = function () {
    this.basePath = Constants.basePath
    this.name = Constants.defaultName
  }

  /**
   * For testing purposes it is useful to be able to close the database so that
   * you can re-open it in the same process.
   */
  DB.prototype.close = function () {
    return this.pouchdb.close()
  }

  /**
   * Asynchronous initialization function to actually set up the database -
   * this is what you should call to initialize.
   */
  DB.prototype.init = function () {
    let path = Path.join(this.basePath, this.name)
    this.pouchdb = new PouchDB(path)
    return this.info()
  }

  /**
   * Returns a promise to some basic JSON info about the database, such as
   * number of documents.
   */
  DB.prototype.info = function () {
    return this.pouchdb.info()
  }

  return DB
}

inject = require('fullnode/lib/injector')(inject, dependencies)
let DB = inject()
module.exports = DB
