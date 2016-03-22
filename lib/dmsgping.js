/* global fullnode */
/**
 * DMsgPing
 * ========
 *
 * A ping message. Sent when you want a pong, to be sure the connection is
 * working. Note that a DMsgPing is NOT a DMsg in the sense of object-oriented
 * inheritance - we do not use inheritance for messages.
 */
'use strict'
let DMsg = require('./dmsg')
let Random = fullnode.Random
let Struct = fullnode.Struct

function DMsgPing (databuf) {
  if (!(this instanceof DMsgPing)) {
    return new DMsgPing(databuf)
  }
  this.fromObject({databuf})
}

DMsgPing.prototype = Object.create(Struct.prototype)
DMsgPing.prototype.constructor = DMsgPing

DMsgPing.prototype.fromRandom = function () {
  this.databuf = Random.getRandomBuffer(8)
  return this
}

DMsgPing.prototype.fromDMsg = function (msg) {
  this.databuf = msg.databuf
  return this
}

DMsgPing.prototype.toDMsg = function () {
  return DMsg().setCmd('ping').setData(this.databuf)
}

DMsgPing.prototype.isValid = function () {
  if (this.databuf.length === 8) {
    return true
  } else {
    return false
  }
}

DMsgPing.prototype.validate = function () {
  if (!this.isValid()) {
    throw new Error('invalid msgping')
  }
  return this
}

module.exports = DMsgPing
