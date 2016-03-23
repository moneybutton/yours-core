/* global Fullnode */
/**
 * DMsgPong
 * ========
 *
 * A pong message. This is exactly the same as a ping message, except you would
 * never generate one from random. You generate from a ping message sent by one
 * of your peers. And, of course, the command is "pong" instead of "ping".
 */
'use strict'
let DMsg = require('./dmsg')
let Struct = Fullnode.Struct

function DMsgPong (databuf) {
  if (!(this instanceof DMsgPong)) {
    return new DMsgPong(databuf)
  }
  this.fromObject({databuf})
}

DMsgPong.prototype = Object.create(Struct.prototype)
DMsgPong.prototype.constructor = DMsgPong

DMsgPong.prototype.fromDMsgPing = function (msgping) {
  this.databuf = msgping.databuf
  return this
}

DMsgPong.prototype.toDMsg = function () {
  return DMsg().setCmd('pong').setData(this.databuf)
}

module.exports = DMsgPong
