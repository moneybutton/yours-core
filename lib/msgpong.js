/* global fullnode */
/**
 * MsgPong
 * =======
 *
 * A pong message. This is exactly the same as a ping message, except you would
 * never generate one from random. You generate from a ping message sent by one
 * of your peers. And, of course, the command is "pong" instead of "ping".
 */
'use strict'
let Msg = require('./msg')
let Struct = fullnode.Struct

function MsgPong (databuf) {
  if (!(this instanceof MsgPong)) {
    return new MsgPong(databuf)
  }
  this.fromObject({databuf})
}

MsgPong.prototype = Object.create(Struct.prototype)
MsgPong.prototype.constructor = MsgPong

MsgPong.prototype.fromMsgPing = function (msgping) {
  this.databuf = msgping.databuf
  return this
}

MsgPong.prototype.toMsg = function () {
  return Msg().setCmd('pong').setData(this.databuf)
}

module.exports = MsgPong
