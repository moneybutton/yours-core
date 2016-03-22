/* global fullnode */
/**
 * DBContentAuth
 * =============
 *
 * An interface to store and retrieve ContentAuth objects from the database.
 */
'use strict'
let ContentAuth = require('./contentauth')
let Struct = fullnode.Struct

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
 */
DBContentAuth.prototype.asyncSave = function (contentauth) {
  if (!contentauth) {
    contentauth = this.contentauth
  }
  let hashbuf
  let _id
  return contentauth.asyncGetHash().then((_hashbuf) => {
    hashbuf = _hashbuf
    _id = hashbuf.toString('hex')
    let contentauthhex = contentauth.toBuffer().toString('hex')
    return this.db.put({_id, contentauthhex})
  }).then(() => {
    this.hashbuf = hashbuf
    return hashbuf
  })
}

/**
 * Get a piece of authenticated content by its hash.
 */
DBContentAuth.prototype.asyncGet = function (hashbuf) {
  let hashhex = hashbuf.toString('hex')
  return this.db.asyncGet(hashhex).then((doc) => {
    this.hashbuf = hashbuf
    // TODO: Replace this with a non-blocking method.
    this.contentauth = ContentAuth().fromHex(doc.contentauthhex)
    this.contentauth.setCacheHash(hashbuf)
    return this.contentauth
  })
}

/**
 * TODO: This method is used for testing purposes, but should probably be
 * removed before launching to the public. There is no reason to have a method
 * that "gets all documents", which could potentially be an enormous amount of
 * data.
 */
DBContentAuth.prototype.asyncGetAll = function () {
  return this.db.allDocs({include_docs: true}).then((res) => {
    let contentauths = []
    for (let obj of res.rows) {
      let doc = obj.doc
      if (doc.contentauthhex) {
        // TODO: Replace this .fromHex with a non-blocking method.
        let contentauth = ContentAuth().fromHex(doc.contentauthhex)
        let hashbuf = new Buffer(doc._id, 'hex')
        contentauth.setCacheHash(hashbuf)
        contentauths.push(contentauth)
      } // else, the document is not a contentauth, so don't push
    }
    return contentauths
  })
}

module.exports = DBContentAuth
