/**
 * Database
 * ========
 *
 * For storing content and actions.
 */
'use strict'
let Constants = require('./constants').DB
let Path = require('path')
let PouchDB = require('pouchdb')
let Struct = require('fullnode/lib/struct')

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
  return this
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
 * For testing purposes it is useful to be able to close the database so that
 * you can re-open it in the same process.
 */
DB.prototype.close = function () {
  return this.pouchdb.close()
}

/**
 * Returns a promise to some basic JSON info about the database, such as
 * number of documents.
 */
DB.prototype.info = function () {
  return this.pouchdb.info()
}

/**
 * Add a document to the database.
 */
DB.prototype.put = function (doc) {
  return this.pouchdb.put(doc)
}

/**
 * Get a document from the database by its id.
 */
DB.prototype.get = function (id) {
  return this.pouchdb.get(id)
}

/**
 * Destroy, i.e. delete, the database. This does not attempt to securely
 * erase the database - merely clear the space.
 */
DB.prototype.destroy = function () {
  return this.pouchdb.destroy()
}

module.exports = DB
