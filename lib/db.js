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

  function DB (name, pouchdb) {
    if (!(this instanceof DB)) {
      return new DB(name, pouchdb)
    }
    this.fromObject({
      name: name,
      pouchdb: pouchdb
    })
  }

  DB.prototype = Object.create(Struct.prototype)
  DB.prototype.constructor = DB

  DB.prototype.initialize = function () {
    let path = Path.join(Constants.basePath, this.name)
    this.pouchdb = new PouchDB(path)
    return this
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
