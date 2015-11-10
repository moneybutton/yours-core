/**
 * CoreContent
 * ===========
 *
 * A manager for content that can create new content and store it to the
 * database and retrieve content. It uses primiarily ContentAuth and
 * DBContentAuth. It is undecided whether it will also support unauthenticated
 * content. It is also undecided whether this class will have anything to do
 * with network connections - i.e. will it be used to broadcast new content?
 * Perhaps.
 */
'use strict'
let Content = require('./content')
let ContentAuth = require('./content-auth')
let DBContentAuth = require('./db-content-auth')
let Struct = require('fullnode/lib/struct')
let Keypair = require('fullnode/lib/keypair')
let EventEmitter = require('events')
let spawn = require('./spawn')

function CoreContent (db) {
  if (!(this instanceof CoreContent)) {
    return new CoreContent(db)
  }
  this.fromObject({db})
}

CoreContent.prototype = Object.create(Struct.prototype)
CoreContent.prototype.constructor = CoreContent
Object.assign(CoreContent.prototype, EventEmitter.prototype)

/**
 * Create a new contentauth and return it - but do not post it to db or
 * broadcast it.
 */
CoreContent.prototype.asyncNewContentAuth = function (pubkey, privkey, address, name, label, title, body, blockhashbuf, blockheightnum) {
  let content = Content(name, label, title, 'markdown', body)
  let contentbuf = content.toBuffer()

  let contentauth = ContentAuth().fromObject({
    blockhashbuf: blockhashbuf,
    blockheightnum: blockheightnum,
    address: address,
    contentbuf: contentbuf
  })
  let keypair = Keypair(privkey, pubkey)
  return contentauth.asyncSign(keypair)
}

/**
 * Save a contentauth to the db. Does not broadcast the contentauth.
 */
CoreContent.prototype.asyncPostContentAuth = function (contentauth) {
  return spawn(function *() {
    let res = yield DBContentAuth(this.db).asyncSave(contentauth)
    this.emit('content-auth', contentauth)
    return res
  }.bind(this))
}

/**
 * Make a new ContentAuth and post it. The easiest way to post new content.
 * TODO: Should this also broadcast to the peers?
 */
CoreContent.prototype.asyncPostNewContentAuth = function (pubkey, privkey, address, name, label, title, body, blockhashbuf, blockheightnum) {
  return spawn(function *() {
    let contentauth = yield this.asyncNewContentAuth(pubkey, privkey, address, name, label, title, body, blockhashbuf, blockheightnum)
    return this.asyncPostContentAuth(contentauth)
  }.bind(this))
}

/**
 * Get recent content. TODO: This should *NOT* retrieve all content. It should
 * retrieve knowably recent content, i.e. content that signed the latest
 * blockhashbuf.
 */
CoreContent.prototype.asyncGetRecentContentAuth = function () {
  return DBContentAuth(this.db).asyncGetAll()
}

module.exports = CoreContent
