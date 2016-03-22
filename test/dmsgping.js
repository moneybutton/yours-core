/* global fullnode,describe,it */
'use strict'
let should = require('should')
let DMsgPing = require('../lib/dmsgping')
let DMsg = require('../lib/dmsg')
let Random = fullnode.Random

describe('DMsgPing', function () {
  let msgping

  it('should exist', function () {
    should.exist(DMsgPing)
  })

  describe('#fromRandom', function () {
    it('should make a new DMsgPing', function () {
      msgping = DMsgPing().fromRandom()
      msgping.databuf.length.should.equal(8)
    })
  })

  describe('#fromDMsg', function () {
    it('should make a new DMsgPing from a DMsg', function () {
      let databuf = Random.getRandomBuffer(8)
      let msg = DMsg().setCmd('ping').setData(databuf)
      msgping = DMsgPing().fromDMsg(msg)
      msgping.databuf.length.should.equal(8)
    })
  })

  describe('#toDMsg', function () {
    it('should make a DMsg from a DMsgPing', function () {
      let msg = msgping.toDMsg()
      ;(msg instanceof DMsg).should.equal(true)
      msg.cmdbuf.slice(0, 4).toString().should.equal('ping')
      Buffer.compare(msg.databuf, msgping.databuf).should.equal(0)
    })
  })

  describe('#isValid', function () {
    it('should know 8 bytes is valid and 9 bytes is invalid', function () {
      let buf1 = new Buffer(8)
      buf1.fill(0)
      DMsgPing(buf1).isValid().should.equal(true)
      let buf2 = new Buffer(9)
      buf2.fill(0)
      DMsgPing(buf2).isValid().should.equal(false)
    })
  })
})
