/**
 * CoreUser
 * ========
 *
 * The "high level" user class that has access both to the database DBUser
 * class and the normal User class. While User is about setting/verifying a
 * user properties in memory, and DBUser is about putting/getting a user from
 * the database, CoreUser is about managing what user is actually set in the
 * database, i.e. the current user.
 */
'use strict'
let User = require('./user')
let DBUser = require('./db-user')
let MsgAuth = require('./msg-auth')
let Struct = require('fullnode/lib/struct')
let CryptoWorkers = require('./crypto-workers')
let asink = require('asink')

function CoreUser (db, dbuser, user) {
  if (!(this instanceof CoreUser)) {
    return new CoreUser(db, dbuser, user)
  }
  this.initialize()
  this.fromObject({db, dbuser, user})
}

CoreUser.prototype = Object.create(Struct.prototype)
CoreUser.prototype.constructor = CoreUser

CoreUser.prototype.initialize = function () {
  this.user = User()
  return this
}

/**
 * Get the user from the database if it is there, otherwise set a new random
 * user.
 */
CoreUser.prototype.asyncInitialize = function () {
  return asink(function *() {
    this.dbuser = DBUser(this.db)
    try {
      this.user = yield this.dbuser.asyncGet()
    } catch (err) {
      if (err.message !== 'missing') {
        throw err
      }
      this.user = yield User().asyncFromRandom()
      yield this.dbuser.asyncSave(this.user)
    }
    return this
  }.bind(this))
}

CoreUser.prototype.asyncSetName = function (name) {
  // TODO: Handle the case where we set the name in memory, but saving to disk
  // fails.
  try {
    this.user.setName(name)
  } catch (err) {
    return Promise.reject(err)
  }
  return this.dbuser.asyncSave(this.user).then(() => this)
}

/**
 * After setting your name, you may wish to 'auth', that is send a piece of
 * content to your peers declaring what your name is. This gets that message.
 */
CoreUser.prototype.asyncGetMsgAuth = function (blockhashbuf, blockheightnum) {
  let msgauth = MsgAuth()
  msgauth.setBlockInfo(blockhashbuf, blockheightnum)
  msgauth.setName(this.user.name)
  let buf = msgauth.getBufForSig()
  return CryptoWorkers.asyncSha256(buf).then((hashbuf) => {
    let privkey = this.user.masterxprv.privkey
    return CryptoWorkers.asyncSignCompact(hashbuf, privkey)
  }).then(sig => {
    msgauth.contentauth.fromObject({
      pubkey: this.user.masterxprv.pubkey,
      sig: sig
    })
    return msgauth
  })
}

module.exports = CoreUser
