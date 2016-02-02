/* global describe,it,before */
'use strict'
let BN = require('fullnode/lib/bn')
let BR = require('fullnode/lib/br')
let Content = require('../../core/content')
let Keypair = require('fullnode/lib/keypair')
let Msg = require('../../core/msg')
let MsgAuth = require('../../core/msg-auth')
let Privkey = require('fullnode/lib/privkey')
let asink = require('asink')
let should = require('should')

describe('MsgAuth', function () {
  let blockidhex = '00000000000000000e6188a4cc93e3d3244b20bfdef1e9bd9db932e30f3aa2f1'
  let blockhashbuf = BR(new Buffer(blockidhex, 'hex')).readReverse()
  let blockheightnum = 376949

   let msghex = '255a484b6175746800000000000000000000021c022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe420516b71889e9c584536df54eb1f2318d5088fb25b47afd202bcfc98944023b4427a611cf29f8e8bb6119b4b7eaa7ded61b87152c9ae79f9e1741ffc34b33fb602f1a23a0fe332b99dbde9f1debf204b24d3e393cca488610e00000000000000000005c0760000000000000000000000000000000000000000000000000000000000000000000001503054427b004747e8746cddb33b0f7f95a90f89f89fb387cbb67b226e616d65223a226d795f6e616d65222c226c6162656c223a2261757468222c227469746c65223a2248656c6c6f2c206d79206e616d65206973206d795f6e616d65222c2274797065223a226d61726b646f776e222c22626f6479223a222323232048656c6c6f2044617474215c6e4c6574206d6520696e74726f64756365206d7973656c662e2e2e204d79206e616d65206973202a6d795f6e616d652a2e5c6e5c6e5c6e5c6e4d792063686f696365206f6620757365726e616d65206973206265696e6720736176656420696e2074686520626c6f636b636861696e20666f7220706f737465726974792e5c6e5c6e5f426c6f636b206865696768743a203337363935305f5c6e5f426c6f636b20686173683a20663161323361306665333332623939646264653966316465626632303462323464336533393363636134383836313065303030303030303030303030303030305f227d'
   let msghexblockinfoset = '255a484b6175746800000000000000000000021c022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe420516b71889e9c584536df54eb1f2318d5088fb25b47afd202bcfc98944023b4427a611cf29f8e8bb6119b4b7eaa7ded61b87152c9ae79f9e1741ffc34b33fb602f1a23a0fe332b99dbde9f1debf204b24d3e393cca488610e00000000000000000005c0750000000000000000000000000000000000000000000000000000000000000000000001503054427b004747e8746cddb33b0f7f95a90f89f89fb387cbb67b226e616d65223a226d795f6e616d65222c226c6162656c223a2261757468222c227469746c65223a2248656c6c6f2c206d79206e616d65206973206d795f6e616d65222c2274797065223a226d61726b646f776e222c22626f6479223a222323232048656c6c6f2044617474215c6e4c6574206d6520696e74726f64756365206d7973656c662e2e2e204d79206e616d65206973202a6d795f6e616d652a2e5c6e5c6e5c6e5c6e4d792063686f696365206f6620757365726e616d65206973206265696e6720736176656420696e2074686520626c6f636b636861696e20666f7220706f737465726974792e5c6e5c6e5f426c6f636b206865696768743a203337363935305f5c6e5f426c6f636b20686173683a20663161323361306665333332623939646264653966316465626632303462323464336533393363636134383836313065303030303030303030303030303030305f227d'


   let msgauthhex = '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe420516b71889e9c584536df54eb1f2318d5088fb25b47afd202bcfc98944023b4427a611cf29f8e8bb6119b4b7eaa7ded61b87152c9ae79f9e1741ffc34b33fb602f1a23a0fe332b99dbde9f1debf204b24d3e393cca488610e00000000000000000005c0760000000000000000000000000000000000000000000000000000000000000000000001503054427b004747e8746cddb33b0f7f95a90f89f89fb387cbb67b226e616d65223a226d795f6e616d65222c226c6162656c223a2261757468222c227469746c65223a2248656c6c6f2c206d79206e616d65206973206d795f6e616d65222c2274797065223a226d61726b646f776e222c22626f6479223a222323232048656c6c6f2044617474215c6e4c6574206d6520696e74726f64756365206d7973656c662e2e2e204d79206e616d65206973202a6d795f6e616d652a2e5c6e5c6e5c6e5c6e4d792063686f696365206f6620757365726e616d65206973206265696e6720736176656420696e2074686520626c6f636b636861696e20666f7220706f737465726974792e5c6e5c6e5f426c6f636b206865696768743a203337363935305f5c6e5f426c6f636b20686173683a20663161323361306665333332623939646264653966316465626632303462323464336533393363636134383836313065303030303030303030303030303030305f227d'
    

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
      msgauth.setBlockInfo(blockhashbuf, blockheightnum).toMsg().toHex().should.equal(msghexblockinfoset)
    })

    it('should set known incorrect block info', function () {
      let msgauth2 = MsgAuth().fromObject(msgauth)
      msgauth2.setBlockInfo(blockhashbuf, blockheightnum + 1).toMsg().toHex().should.not.equal(msghexblockinfoset)
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
