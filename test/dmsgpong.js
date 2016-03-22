/* global describe,it */
'use strict'
let should = require('should')
let DMsg = require('../lib/dmsg')
let DMsgPing = require('../lib/dmsgping')
let DMsgPong = require('../lib/dmsgpong')

describe('DMsgPong', function () {
  let msgping = DMsgPing().fromRandom()
  let msgpong

  it('should exist', function () {
    should.exist(DMsgPong)
  })

  describe('#fromDMsgPing', function () {
    it('should make a new DMsgPong from a DMsgPing', function () {
      msgpong = DMsgPong().fromDMsgPing(msgping)
      Buffer.compare(msgpong.databuf, msgping.databuf).should.equal(0)
    })
  })

  describe('#toDMsg', function () {
    it('should make a DMsg from a DMsgPing', function () {
      let msg = msgpong.toDMsg()
      ;(msg instanceof DMsg).should.equal(true)
      msg.cmdbuf.slice(0, 4).toString().should.equal('pong')
      Buffer.compare(msg.databuf, msgpong.databuf).should.equal(0)
    })
  })
})
