/* global describe,it */
'use strict'
let should = require('should')
let MsgPing = require('../../lib/msg-ping')
let Msg = require('../../lib/msg')
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
})
