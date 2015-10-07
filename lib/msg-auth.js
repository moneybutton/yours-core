/**
 * MsgAuth
 * =======
 *
 * A message to sign your username and possibly as-yet undecided other
 * information to be sent to peers. Note that a MsgAuth object is basically
 * just a ContentAuth object in a certain format - it is authenticated content
 * posted with the "auth" label. The only difference between this and a
 * MsgContentAuth is that this message does NOT contain a hash of the
 * ContentAuth object, and also the message type is "auth" instead of
 * "contentauth".
 */
'use strict'
let Msg = require('./msg')
let Struct = require('fullnode/lib/struct')
let ContentAuth = require('./content-auth')
let Content = require('./content')

function MsgAuth (contentauth) {
  if (!(this instanceof MsgAuth)) {
    return new MsgAuth(contentauth)
  }
  this.initialize()
  this.fromObject({
    contentauth: contentauth
  })
}

MsgAuth.prototype = Object.create(Struct.prototype)
MsgAuth.prototype.constructor = MsgAuth

MsgAuth.prototype.initialize = function () {
  this.contentauth = ContentAuth()
  this.setName('satoshi')
  return this
}

 /**
  * Note that this method and the corresponding method of fromBuffer are slow
  * because of the pubkey .fromDER method, which operates on compressed
  * public keys. They should not be used when we don't want to block. TODO:
  * Create asynchronous versions of these somehow using AsyncCrypto.
  */
MsgAuth.prototype.fromBR = function (br) {
  this.contentauth.fromBR(br)
  return this
}

MsgAuth.prototype.toBW = function (bw) {
  return this.contentauth.toBW(bw)
}

MsgAuth.prototype.fromMsg = function (msg) {
  this.fromBuffer(msg.databuf)
  return this
}

MsgAuth.prototype.toMsg = function () {
  let buf = this.toBuffer()
  return Msg().setCmd('auth').setData(buf)
}

MsgAuth.prototype.setBlockInfo = function (blockhashbuf, blockheightnum) {
  this.contentauth.blockhashbuf = blockhashbuf
  this.contentauth.blockheightnum = blockheightnum
  return this
}

MsgAuth.prototype.setName = function (name) {
  let content = Content().fromObject({
    name: name,
    label: 'auth',
    title: 'I am ' + name,
    type: 'markdown',
    body: ''
  })
  this.contentauth.setContent(content)
  return this
}

MsgAuth.prototype.getBufForSig = function () {
  return this.contentauth.getBufForSig()
}

/**
 * Synchronous sign. Do not use in the main thread.
 */
MsgAuth.prototype.sign = function (keypair) {
  this.contentauth.sign(keypair)
  return this
}

/**
 * Asynchronous sign. Safe to use in the main thread.
 */
MsgAuth.prototype.asyncSign = function (keypair) {
  return this.contentauth.asyncSign(keypair).then(() => {
    return this
  })
}

/**
 * Synchronous verify. Do not use in the main thread.
 */
MsgAuth.prototype.verify = function () {
  return this.contentauth.verify()
}

/**
 * Asynchronous verify that uses workers. Safe to use in the main thread.
 */
MsgAuth.prototype.asyncVerify = function () {
  return this.contentauth.asyncVerify()
}

module.exports = MsgAuth
