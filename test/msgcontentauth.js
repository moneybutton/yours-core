/* global fullnode,describe,it */
'use strict'
let ContentAuth = require('../lib/contentauth')
let Hash = fullnode.Hash
let Msg = require('../lib/msg')
let MsgContentAuth = require('../lib/msgcontentauth')
let asink = require('asink')
let should = require('should')

describe('MsgContentAuth', function () {
  let contentauthhex = '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe41f04b47a4636d379788e73dc9d2a048966ce7b79c576c8e6e994af10d3fa6a47ce3ddaed3a9b02d2e8e19c6305a0433fb5aa93f6f2a8cd86cdad8b2a30030216a8f1a23a0fe332b99dbde9f1debf204b24d3e393cca488610e00000000000000000005c0750000000000000000000000000000000000000000000000000000000000000000000001503054427b004747e8746cddb33b0f7f95a90f89f89fb387cbb67b226e616d65223a226d796e616d65222c226c6162656c223a226d796c6162656c222c227469746c65223a22636f6e74656e74207469746c65222c2274797065223a226d61726b646f776e222c22626f6479223a22636f6e74656e7420626f6479227d'
  let contentauth = ContentAuth().fromHex(contentauthhex)
  contentauth.getHash()

  it('should exist', function () {
    should.exist(MsgContentAuth)
    should.exist(MsgContentAuth())
    should.exist(MsgContentAuth(contentauth))
  })

  describe('#toBuffer', function () {
    it('should be 32 bytes (one hash) longer than contentauth', function () {
      let msgcontentauth = MsgContentAuth().fromContentAuth(contentauth)
      msgcontentauth.toBuffer().length.should.equal(contentauth.toBuffer().length + 32)
    })
  })

  describe('#fromBuffer', function () {
    it('should convert from known buffer', function () {
      let hashbuf = Hash.sha256(contentauth.toBuffer())
      let buf = Buffer.concat([hashbuf, contentauth.toBuffer()])
      let msgcontentauth = MsgContentAuth().fromBuffer(buf)
      ;(msgcontentauth.contentauth instanceof ContentAuth).should.equal(true)
      Buffer.compare(msgcontentauth.hashbuf, contentauth.getHash()).should.equal(0)
    })
  })

  describe('#fromContentAuth', function () {
    it('should get a msgcontentauth from contentauth', function () {
      let msgcontentauth = MsgContentAuth().fromContentAuth(contentauth)
      msgcontentauth.hashbuf.toString('hex').should.equal(contentauth.getHash().toString('hex'))
    })
  })

  describe('#asyncFromContentAuth', function () {
    it('should get a msgcontentauth from contentauth', function () {
      return asink(function *() {
        let msgcontentauth = yield MsgContentAuth().asyncFromContentAuth(contentauth)
        msgcontentauth.hashbuf.toString('hex').should.equal(contentauth.getHash().toString('hex'))
      })
    })
  })

  describe('#toMsg', function () {
    it('should return a msg', function () {
      let msgcontentauth = MsgContentAuth().fromContentAuth(contentauth)
      let msg = msgcontentauth.toMsg()
      ;(msg instanceof Msg).should.equal(true)
    })
  })

  describe('#fromMsg', function () {
    it('should convert from a msg', function () {
      let msgcontentauth = MsgContentAuth().fromContentAuth(contentauth)
      let msg = msgcontentauth.toMsg()
      let msgcontentauth2 = MsgContentAuth().fromMsg(msg)
      msgcontentauth2.toHex().should.equal(msgcontentauth.toHex())
    })
  })
})
