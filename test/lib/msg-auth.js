/* global describe,it,before */
'use strict'
let MsgAuth = require('../../lib/msg-auth')
let Msg = require('../../lib/msg')
let BR = require('fullnode/lib/br')
let should = require('should')
let Privkey = require('fullnode/lib/privkey')
let BN = require('fullnode/lib/bn')
let Keypair = require('fullnode/lib/keypair')
let Hash = require('fullnode/lib/hash')
let ECDSA = require('fullnode/lib/ecdsa')
let BW = require('fullnode/lib/bw')

describe('MsgAuth', function () {
  let blockidhex = '00000000000000000e6188a4cc93e3d3244b20bfdef1e9bd9db932e30f3aa2f1'
  let blockhashbuf = BR(new Buffer(blockidhex, 'hex')).readReverse()
  let blockheightnum = 376949

  let msghex = '255a484b61757468000000000000000000000098022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe42014a0030afb0c1bb9a20ef333e31506d1ad256ea8309123d96f7e1c303faa989f4cb8eaa626626671dcad58bb5ac08dbf67227524aad25698ff0f41e05d552526f1a23a0fe332b99dbde9f1debf204b24d3e393cca488610e00000000000000000005c0757b226e616d65223a226d795f6e616d65227d'
  let msgauthhex = '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe42014a0030afb0c1bb9a20ef333e31506d1ad256ea8309123d96f7e1c303faa989f4cb8eaa626626671dcad58bb5ac08dbf67227524aad25698ff0f41e05d552526f1a23a0fe332b99dbde9f1debf204b24d3e393cca488610e00000000000000000005c0757b226e616d65223a226d795f6e616d65227d'
  let privkey = Privkey().fromBN(BN(5))
  let keypair = Keypair().fromPrivkey(privkey)
  let sig
  let jsonbuf = new Buffer(JSON.stringify({name: 'my_name'}))
  let msgauth

  before(function () {
    msgauth = MsgAuth().fromObject({blockhashbuf, blockheightnum, jsonbuf})
    let databuf = msgauth.getBufForSig()
    let hashbuf = Hash.sha256(databuf)
    sig = ECDSA.sign(hashbuf, keypair)
    sig = ECDSA.calcrecovery(sig, keypair.pubkey, hashbuf)
    msgauth.pubkey = keypair.pubkey
    msgauth.sig = sig
  })

  it('should exist', function () {
    should.exist(MsgAuth)
    should.exist(MsgAuth())
  })

  describe('#fromHex', function () {
    it('should derive this known auth message', function () {
      let msgauth = MsgAuth().fromHex(msgauthhex)
      msgauth.pubkey.point.eq(keypair.pubkey.point).should.equal(true)
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
    it('should set the same name', function () {
      msgauth.setName('my_name').toMsg().toHex().should.equal(msghex)
    })

    it('should set a different name', function () {
      let msgauth2 = MsgAuth().fromObject(msgauth)
      msgauth2.setName('my_name_2').toMsg().toHex().should.not.equal(msghex)
    })
  })

  describe('#getBufForSig', function () {
    it('should give blockhashbuf, blockheightnum, jsonbuf', function () {
      let buf1 = blockhashbuf
      let buf2 = BW().writeUInt32BE(blockheightnum).toBuffer()
      let buf3 = jsonbuf
      let buf = Buffer.concat([buf1, buf2, buf3])
      Buffer.compare(msgauth.getBufForSig(), buf).should.equal(0)
    })
  })

  describe('#validate', function () {
    it('should know this is a valid auth message', function () {
      return msgauth.validate().then(valid => {
        valid.should.equal(true)
      })
    })
  })
})
