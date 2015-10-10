/**
 * MsgPing
 * =======
 *
 * A ping message. Sent when you want a pong, to be sure the connection is
 * working. Note that a MsgPing is NOT a Msg in the sense of object-oriented
 * inheritance - we do not use inheritance for messages.
 */
'use strict'
let Msg = require('./msg')
let Random = require('fullnode/lib/random')
let Struct = require('fullnode/lib/struct')

function MsgPing (databuf) {
  if (!(this instanceof MsgPing)) {
    return new MsgPing(databuf)
  }
  this.fromObject({databuf})
}

MsgPing.prototype = Object.create(Struct.prototype)
MsgPing.prototype.constructor = MsgPing

MsgPing.prototype.fromRandom = function () {
  this.databuf = Random.getRandomBuffer(8)
  return this
}

MsgPing.prototype.fromMsg = function (msg) {
  this.databuf = msg.databuf
  return this
}

MsgPing.prototype.toMsg = function () {
  return Msg().setCmd('ping').setData(this.databuf)
}

MsgPing.prototype.isValid = function () {
  if (this.databuf.length === 8) {
    return true
  } else {
    return false
  }
}

module.exports = MsgPing
