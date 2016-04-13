/* global Fullnode */
/**
 * DBContentAuth
 * =============
 *
 * An interface to store and retrieve ContentAuth objects from the database.
 */
'use strict'
let ContentAuth = require('./contentauth')
let Struct = Fullnode.Struct
let asink = require('asink')

function DBContentAuth (db, contentauth) {
  if (!(this instanceof DBContentAuth)) {
    return new DBContentAuth(db, contentauth)
  }
  this.fromObject({db, contentauth})
}

DBContentAuth.prototype = Object.create(Struct.prototype)
DBContentAuth.prototype.constructor = DBContentAuth

/**
 * Note that you can only save a document once. This should be all that is
 * necessary because content is addressed by hash and cannot change. If you try
 * to save content with the same hash a second time, an error will occur. This
 * method will return the _id, or the hash, of the document.
 *
 * time is the time in milliseconds.
 */
DBContentAuth.prototype.asyncSave = function (contentauth, time) {
  return asink(function *() {
    if (!contentauth) {
      contentauth = this.contentauth
    }
    let hashbuf = yield contentauth.asyncGetHash()
    let _id = hashbuf.toString('hex')
    let contentauthhex = contentauth.toHex()
    if (!time) {
      time = Date.now()
    }
    // TODO: Save contentauth as an attachment, not hex
    yield this.db.asyncPut({_id, contentauthhex, time})
    this.hashbuf = hashbuf
    return hashbuf
  }, this)
}

/**
 * Get a piece of authenticated content by its hash.
 */
DBContentAuth.prototype.asyncGet = function (hashbuf) {
  return asink(function *() {
    if (!Buffer.isBuffer(hashbuf)) {
      throw new Error('hashbuf must be a buffer')
    }
    let hashhex = hashbuf.toString('hex')
    let doc = yield this.db.asyncGet(hashhex)
    this.hashbuf = hashbuf
    this.contentauth = ContentAuth().fromHex(doc.contentauthhex)
    this.contentauth.setCacheHash(hashbuf)
    return this.contentauth
  }, this)
}

DBContentAuth.docsToContentAuths = function (docs) {
  let contentauths = []
  for (let doc of docs) {
    if (doc.contentauthhex) {
      // TODO: Replace this .fromHex with a non-blocking method.
      let contentauth = ContentAuth().fromHex(doc.contentauthhex)
      let hashbuf = new Buffer(doc._id, 'hex')
      contentauth.setCacheHash(hashbuf)
      contentauths.push(contentauth)
    } // else, the document is not a contentauth, so don't push
  }
  return contentauths
}

/**
 * Get recent contentauths sorted in descending chronological order *from the
 * time received*, not the time listed inside the contentauth.
 */
DBContentAuth.prototype.asyncGetRecent = function (count) {
  return asink(function *() {
    let res = yield this.db.asyncFind({
      selector: {time: {'$lte': Date.now()}},
      sort: [{time: 'desc'}],
      limit: count
    })
    let docs = res.docs
    return DBContentAuth.docsToContentAuths(docs)
  }, this)
}

/**
 * TODO: This method is used for testing purposes, but should probably be
 * removed before launching to the public. There is no reason to have a method
 * that "gets all documents", which could potentially be an enormous amount of
 * data.
 */
DBContentAuth.prototype.asyncGetAll = function () {
  return asink(function *() {
    let res = yield this.db.asyncAllDocs({include_docs: true})
    let docs = res.rows
    docs = docs.map((doc) => doc.doc)
    return DBContentAuth.docsToContentAuths(docs)
  }, this)
}

module.exports = DBContentAuth
