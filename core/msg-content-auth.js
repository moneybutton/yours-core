/**
 * MsgContentAuth
 * ==============
 *
 * A message delivering authenticated content. Use this if you want to send
 * authenticated content to a peer.
 */
'use strict'
let BW = fullnode.BW
let ContentAuth = require('./content-auth')
let Msg = require('./msg')
let Struct = fullnode.Struct
let asink = require('asink')

function MsgContentAuth (hashbuf, contentauth) {
  if (!(this instanceof MsgContentAuth)) {
    return new MsgContentAuth(hashbuf, contentauth)
  }
  this.fromObject({hashbuf, contentauth})
}

MsgContentAuth.prototype = Object.create(Struct.prototype)
MsgContentAuth.prototype.constructor = MsgContentAuth

MsgContentAuth.prototype.toBW = function (bw) {
  if (!bw) {
    bw = BW()
  }
  bw.write(this.hashbuf)
  this.contentauth.toBW(bw)
  return bw
}

MsgContentAuth.prototype.fromBR = function (br) {
  this.hashbuf = br.read(32)
  this.contentauth = ContentAuth().fromBR(br)
  this.contentauth.setCacheHash(this.hashbuf)
  return this
}

/**
 * Blocking method. Do not use in main thread.
 */
MsgContentAuth.prototype.fromContentAuth = function (contentauth) {
  this.hashbuf = contentauth.getHash()
  this.contentauth = contentauth
  return this
}

/**
 * Non-blocking fromContentAuth - safe to use in main thread.
 */
MsgContentAuth.prototype.asyncFromContentAuth = function (contentauth) {
  return asink(function *() {
    let hashbuf = yield contentauth.asyncGetHash()
    this.hashbuf = hashbuf
    this.contentauth = contentauth
    return this
  }, this)
}

MsgContentAuth.prototype.fromMsg = function (msg) {
  this.fromBuffer(msg.databuf)
  return this
}

MsgContentAuth.prototype.toMsg = function () {
  let buf = this.toBuffer()
  return Msg().setCmd('contentauth').setData(buf)
}

MsgContentAuth.prototype.validate = function () {
  // TODO: Insert some validation to make sure this is a valid MsgContentAuth.
  // Note that the message has already been successfully parsed if we have made
  // it here, so being able to parse the message should not be a part of this
  // validation
}

module.exports = MsgContentAuth
