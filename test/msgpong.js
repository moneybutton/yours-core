/* global describe,it */
'use strict'
let should = require('should')
let Msg = require('../lib/msg')
let MsgPing = require('../lib/msgping')
let MsgPong = require('../lib/msgpong')

describe('MsgPong', function () {
  let msgping = MsgPing().fromRandom()
  let msgpong

  it('should exist', function () {
    should.exist(MsgPong)
  })

  describe('#fromMsgPing', function () {
    it('should make a new MsgPong from a MsgPing', function () {
      msgpong = MsgPong().fromMsgPing(msgping)
      Buffer.compare(msgpong.databuf, msgping.databuf).should.equal(0)
    })
  })

  describe('#toMsg', function () {
    it('should make a Msg from a MsgPing', function () {
      let msg = msgpong.toMsg()
      ;(msg instanceof Msg).should.equal(true)
      msg.cmdbuf.slice(0, 4).toString().should.equal('pong')
      Buffer.compare(msg.databuf, msgpong.databuf).should.equal(0)
    })
  })
})
