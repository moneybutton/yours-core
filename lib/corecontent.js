/* global Fullnode */
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
let ContentAuth = require('./contentauth')
let DBContentAuth = require('./dbcontentauth')
let Struct = Fullnode.Struct
let Keypair = Fullnode.Keypair
let EventEmitter = require('events')
let asink = require('asink')

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
  return asink(function *() {
    let res = yield DBContentAuth(this.db).asyncSave(contentauth)
    this.emit('contentauth', contentauth)
    return res
  }, this)
}

/**
 * Make a new ContentAuth and post it. The easiest way to post new content.
 * TODO: Should this also broadcast to the peers?
 */
CoreContent.prototype.asyncPostNewContentAuth = function (pubkey, privkey, address, name, label, title, body, blockhashbuf, blockheightnum) {
  return asink(function *() {
    let contentauth = yield this.asyncNewContentAuth(pubkey, privkey, address, name, label, title, body, blockhashbuf, blockheightnum)
    return this.asyncPostContentAuth(contentauth)
  }, this)
}

/**
 * Get 20 most recent contentauths.
 */
CoreContent.prototype.asyncGetRecentContentAuth = function () {
  return asink(function *() {
    let contentauths = yield DBContentAuth(this.db).asyncGetRecent(20)
    return contentauths
  }, this)
}

CoreContent.prototype.asyncGetContentAuth = function (hashbuf) {
  return DBContentAuth(this.db).asyncGet(hashbuf)
}

module.exports = CoreContent
