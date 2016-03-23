/* global Fullnode */
/**
 * DMsgContentAuth
 * ===============
 *
 * A message delivering authenticated content. Use this if you want to send
 * authenticated content to a peer.
 */
'use strict'
let BW = Fullnode.BW
let ContentAuth = require('./contentauth')
let DMsg = require('./dmsg')
let Struct = Fullnode.Struct
let asink = require('asink')

function DMsgContentAuth (hashbuf, contentauth) {
  if (!(this instanceof DMsgContentAuth)) {
    return new DMsgContentAuth(hashbuf, contentauth)
  }
  this.fromObject({hashbuf, contentauth})
}

DMsgContentAuth.prototype = Object.create(Struct.prototype)
DMsgContentAuth.prototype.constructor = DMsgContentAuth

DMsgContentAuth.prototype.toBW = function (bw) {
  if (!bw) {
    bw = BW()
  }
  bw.write(this.hashbuf)
  this.contentauth.toBW(bw)
  return bw
}

DMsgContentAuth.prototype.fromBR = function (br) {
  this.hashbuf = br.read(32)
  this.contentauth = ContentAuth().fromBR(br)
  this.contentauth.setCacheHash(this.hashbuf)
  return this
}

/**
 * Blocking method. Do not use in main thread.
 */
DMsgContentAuth.prototype.fromContentAuth = function (contentauth) {
  this.hashbuf = contentauth.getHash()
  this.contentauth = contentauth
  return this
}

/**
 * Non-blocking fromContentAuth - safe to use in main thread.
 */
DMsgContentAuth.prototype.asyncFromContentAuth = function (contentauth) {
  return asink(function *() {
    let hashbuf = yield contentauth.asyncGetHash()
    this.hashbuf = hashbuf
    this.contentauth = contentauth
    return this
  }, this)
}

DMsgContentAuth.prototype.fromDMsg = function (msg) {
  this.fromBuffer(msg.databuf)
  return this
}

DMsgContentAuth.prototype.toDMsg = function () {
  let buf = this.toBuffer()
  return DMsg().setCmd('contentauth').setData(buf)
}

DMsgContentAuth.prototype.validate = function () {
  // TODO: Insert some validation to make sure this is a valid DMsgContentAuth.
  // Note that the message has already been successfully parsed if we have made
  // it here, so being able to parse the message should not be a part of this
  // validation
}

module.exports = DMsgContentAuth
