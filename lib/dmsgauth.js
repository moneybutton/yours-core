/* global Fullnode */
/**
 * DMsgAuth
 * ========
 *
 * A message to sign your username and possibly as-yet undecided other
 * information to be sent to peers. Note that a DMsgAuth object is basically
 * just a ContentAuth object in a certain format - it is authenticated content
 * posted with the "auth" label. The only difference between this and a
 * DMsgContentAuth is that this message does NOT contain a hash of the
 * ContentAuth object, and also the message type is "auth" instead of
 * "contentauth".
 */
'use strict'
let Content = require('./content')
let ContentAuth = require('./contentauth')
let DMsg = require('./dmsg')
let Struct = Fullnode.Struct
let asink = require('asink')

function DMsgAuth (contentauth) {
  if (!(this instanceof DMsgAuth)) {
    return new DMsgAuth(contentauth)
  }
  this.initialize()
  this.fromObject({contentauth})
}

DMsgAuth.prototype = Object.create(Struct.prototype)
DMsgAuth.prototype.constructor = DMsgAuth

DMsgAuth.prototype.initialize = function () {
  this.contentauth = ContentAuth()
  this.setName('satoshi')
  return this
}

/**
 * Note that this method and the corresponding method of fromBuffer are slow
 * because of the pubkey .fromDER method, which operates on compressed
 * public keys. They should not be used when we don't want to block. TODO:
 * Create asynchronous versions of these somehow using CryptoWorkers.
 */
DMsgAuth.prototype.fromBR = function (br) {
  this.contentauth.fromBR(br)
  return this
}

DMsgAuth.prototype.toBW = function (bw) {
  return this.contentauth.toBW(bw)
}

DMsgAuth.prototype.fromDMsg = function (msg) {
  this.fromBuffer(msg.databuf)
  return this
}

DMsgAuth.prototype.toDMsg = function () {
  let buf = this.toBuffer()
  return DMsg().setCmd('auth').setData(buf)
}

DMsgAuth.prototype.setBlockInfo = function (blockhashbuf, blockheightnum) {
  this.contentauth.blockhashbuf = blockhashbuf
  this.contentauth.blockheightnum = blockheightnum
  return this
}

DMsgAuth.prototype.setName = function (name) {
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

DMsgAuth.prototype.getBufForSig = function () {
  return this.contentauth.getBufForSig()
}

/**
 * Synchronous sign. Do not use in the main thread.
 */
DMsgAuth.prototype.sign = function (keypair) {
  this.contentauth.sign(keypair)
  return this
}

/**
 * Asynchronous sign. Safe to use in the main thread.
 */
DMsgAuth.prototype.asyncSign = function (keypair) {
  return asink(function *() {
    yield this.contentauth.asyncSign(keypair)
    return this
  }, this)
}

/**
 * Synchronous verify. Do not use in the main thread.
 */
DMsgAuth.prototype.verify = function () {
  return this.contentauth.verify()
}

/**
 * Asynchronous verify that uses workers. Safe to use in the main thread.
 */
DMsgAuth.prototype.asyncVerify = function () {
  return this.contentauth.asyncVerify()
}

module.exports = DMsgAuth
