/**
 * DBContentAuth
 * =============
 *
 * An interface to store and retrieve ContentAuth objects from the database.
 */
'use strict'
let ContentAuth = require('./content-auth')
let Struct = require('fullnode/lib/struct')

function DBContentAuth (db, contentauth) {
  if (!(this instanceof DBContentAuth)) {
    return new DBContentAuth(db, contentauth)
  }
  this.fromObject({
    db: db,
    contentauth: contentauth
  })
}

DBContentAuth.prototype = Object.create(Struct.prototype)
DBContentAuth.prototype.constructor = DBContentAuth

/**
 * Note that you can only save a document once. This should be all that is
 * necessary because content is addressed by hash and cannot change. If you try
 * to save content with the same hash a second time, an error will occur. This
 * method will return the _id, or the hash, of the document.
 */
DBContentAuth.prototype.save = function (contentauth) {
  if (!contentauth) {
    contentauth = this.contentauth
  }
  let hashbuf
  let _id
  return contentauth.asyncGetHash().then(_hashbuf => {
    hashbuf = _hashbuf
    _id = hashbuf.toString('hex')
    let contentauthbuf = contentauth.toBuffer()
    return this.db.put({
      _id: _id,
      contentauthhex: contentauthbuf.toString('hex')
    })
  }).then(() => {
    this.hashbuf = hashbuf
    return hashbuf
  })
}

/**
 * Get a piece of authenticated content by its hash.
 */
DBContentAuth.prototype.get = function (hashbuf) {
  let hashhex = hashbuf.toString('hex')
  return this.db.get(hashhex).then(doc => {
    this.hashbuf = hashbuf
    // TODO: Replace this with a non-blocking method.
    this.contentauth = ContentAuth().fromHex(doc.contentauthhex)
    this.contentauth.setHash(hashbuf)
    return this.contentauth
  })
}

/**
 * TODO: This method is used for testing purposes, but should probably be
 * removed before launching to the public. There is no reason to have a method
 * that "gets all documents", which could potentially be an enormous amount of
 * data.
 */
DBContentAuth.prototype.getAll = function () {
  return this.db.allDocs({include_docs: true}).then(res => {
    let contentauths = []
    for (let obj of res.rows) {
      let doc = obj.doc
      if (doc.contentauthhex) {
        // TODO: Replace this .fromHex with a non-blocking method.
        let contentauth = ContentAuth().fromHex(doc.contentauthhex)
        let hashbuf = new Buffer(doc._id, 'hex')
        contentauth.setHash(hashbuf)
        contentauths.push(contentauth)
      } // else, the document is not a contentauth, so don't push
    }
    return contentauths
  })
}

module.exports = DBContentAuth
