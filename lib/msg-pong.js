/**
 * MsgPong
 * =======
 *
 * A pong message. This is exactly the same as a ping message, except you would
 * never generate one from random. You generate from a ping message sent by one
 * of your peers. And, of course, the command is "pong" instead of "ping".
 */
'use strict'
let dependencies = {
  Msg: require('./msg'),
  Struct: require('fullnode/lib/struct')
}

let inject = function (deps) {
  let Msg = deps.Msg
  let Struct = deps.Struct

  function MsgPong (databuf) {
    if (!(this instanceof MsgPong)) {
      return new MsgPong(databuf)
    }
    this.fromObject({
      databuf: databuf
    })
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

  return MsgPong
}

inject = require('fullnode/lib/injector')(inject, dependencies)
let MsgPong = inject()
module.exports = MsgPong
