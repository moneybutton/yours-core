/* global fullnode,describe,it,before */
'use strict'
let BN = fullnode.BN
let BR = fullnode.BR
let Content = require('../core/content')
let Keypair = fullnode.Keypair
let Msg = require('../core/msg')
let MsgAuth = require('../core/msg-auth')
let Privkey = fullnode.Privkey
let asink = require('asink')
let should = require('should')

describe('MsgAuth', function () {
  let blockidhex = '00000000000000000e6188a4cc93e3d3244b20bfdef1e9bd9db932e30f3aa2f1'
  let blockhashbuf = BR(new Buffer(blockidhex, 'hex')).readReverse()
  let blockheightnum = 376949

  let msghex = '255a484b61757468000000000000000000000117022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4206dd2081bbd30b7ad9a0068e311784930e1c0fcd5a6ccc5a83c5d46ccbb8137363e489531a6e26c7ecf743d9d1490ff0bc9d5bfadd30770ece4da6dbb08effc24f1a23a0fe332b99dbde9f1debf204b24d3e393cca488610e00000000000000000005c0750000000000000000000000000000000000000000000000000000000000000000000001503054427b004747e8746cddb33b0f7f95a90f89f89fb387cbb67b226e616d65223a226d795f6e616d65222c226c6162656c223a2261757468222c227469746c65223a224920616d206d795f6e616d65222c2274797065223a226d61726b646f776e222c22626f6479223a22227d'
  let msgauthhex = '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4206dd2081bbd30b7ad9a0068e311784930e1c0fcd5a6ccc5a83c5d46ccbb8137363e489531a6e26c7ecf743d9d1490ff0bc9d5bfadd30770ece4da6dbb08effc24f1a23a0fe332b99dbde9f1debf204b24d3e393cca488610e00000000000000000005c0750000000000000000000000000000000000000000000000000000000000000000000001503054427b004747e8746cddb33b0f7f95a90f89f89fb387cbb67b226e616d65223a226d795f6e616d65222c226c6162656c223a2261757468222c227469746c65223a224920616d206d795f6e616d65222c2274797065223a226d61726b646f776e222c22626f6479223a22227d'
  let privkey = Privkey().fromBN(BN(5))
  let keypair = Keypair().fromPrivkey(privkey)
  let msgauth

  before(function () {
    msgauth = MsgAuth().fromHex(msgauthhex).setName('my_name')
  })

  it('should exist', function () {
    should.exist(MsgAuth)
    should.exist(MsgAuth())
  })

  describe('#fromHex', function () {
    it('should derive this known auth message', function () {
      let msgauth = MsgAuth().fromHex(msgauthhex)
      msgauth.contentauth.pubkey.point.eq(keypair.pubkey.point).should.equal(true)
    })
  })

  describe('#toHex', function () {
    it('should compute this known buffer', function () {
      msgauth.toHex().should.equal(msgauthhex)
    })
  })

  describe('#fromMsg', function () {
    it('should derive this known auth message', function () {
      MsgAuth().fromMsg(Msg().fromHex(msghex)).toHex().should.equal(msgauthhex)
    })
  })

  describe('#toMsg', function () {
    it('should compute this known message', function () {
      msgauth.toMsg().toHex().should.equal(msghex)
    })
  })

  describe('#setBlockInfo', function () {
    it('should set known block info', function () {
      msgauth.setBlockInfo(blockhashbuf, blockheightnum).toMsg().toHex().should.equal(msghex)
    })

    it('should set known incorrect block info', function () {
      let msgauth2 = MsgAuth().fromObject(msgauth)
      msgauth2.setBlockInfo(blockhashbuf, blockheightnum + 1).toMsg().toHex().should.not.equal(msghex)
    })
  })

  describe('#setName', function () {
    it('should set a name', function () {
      let content = Content().fromBuffer(msgauth.setName('my_name').contentauth.contentbuf)
      content.name.should.equal('my_name')
    })
  })

  describe('#sign', function () {
    it('should sign', function () {
      msgauth.sign(keypair)
      should.exist(msgauth.contentauth.pubkey)
      should.exist(msgauth.contentauth.sig)
    })
  })

  describe('#asyncSign', function () {
    it('should sign', function () {
      return asink(function *() {
        msgauth = yield msgauth.asyncSign(keypair)
        should.exist(msgauth.contentauth.pubkey)
        should.exist(msgauth.contentauth.sig)
      })
    })
  })

  describe('#verify', function () {
    it('should know this is a valid auth message', function () {
      let msgauth = MsgAuth().fromHex(msgauthhex)
      msgauth.verify().should.equal(true)
    })
  })

  describe('#asyncVerify', function () {
    it('should know this is a valid auth message', function () {
      return asink(function *() {
        let msgauth = MsgAuth().fromHex(msgauthhex)
        let valid = yield msgauth.asyncVerify()
        valid.should.equal(true)
      })
    })
  })
})
