/* global describe,it */
'use strict'
let should = require('should')
let MsgPing = require('../../core/msg-ping')
let Msg = require('../../core/msg')
let Random = require('fullnode/lib/random')

describe('MsgPing', function () {
  let msgping

  it('should exist', function () {
    should.exist(MsgPing)
  })

  describe('#fromRandom', function () {
    it('should make a new MsgPing', function () {
      msgping = MsgPing().fromRandom()
      msgping.databuf.length.should.equal(8)
    })
  })

  describe('#fromMsg', function () {
    it('should make a new MsgPing from a Msg', function () {
      let databuf = Random.getRandomBuffer(8)
      let msg = Msg().setCmd('ping').setData(databuf)
      msgping = MsgPing().fromMsg(msg)
      msgping.databuf.length.should.equal(8)
    })
  })

  describe('#toMsg', function () {
    it('should make a Msg from a MsgPing', function () {
      let msg = msgping.toMsg()
      ;(msg instanceof Msg).should.equal(true)
      msg.cmdbuf.slice(0, 4).toString().should.equal('ping')
      Buffer.compare(msg.databuf, msgping.databuf).should.equal(0)
    })
  })

  describe('#isValid', function () {
    it('should know 8 bytes is valid and 9 bytes is invalid', function () {
      let buf1 = new Buffer(8)
      buf1.fill(0)
      MsgPing(buf1).isValid().should.equal(true)
      let buf2 = new Buffer(9)
      buf2.fill(0)
      MsgPing(buf2).isValid().should.equal(false)
    })
  })
})
