/* global describe,it */
'use strict'
let ContentAuth = require('../../lib/content-auth')
let Privkey = require('fullnode/lib/privkey')
let Address = require('fullnode/lib/address')
let Keypair = require('fullnode/lib/keypair')
let BR = require('fullnode/lib/br')
let BN = require('fullnode/lib/bn')
let should = require('should')
let Hash = require('fullnode/lib/hash')
let ECDSA = require('fullnode/lib/ecdsa')

describe('ContentAuth', function () {
  let contentauthhex = '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe41f04b47a4636d379788e73dc9d2a048966ce7b79c576c8e6e994af10d3fa6a47ce3ddaed3a9b02d2e8e19c6305a0433fb5aa93f6f2a8cd86cdad8b2a30030216a8f1a23a0fe332b99dbde9f1debf204b24d3e393cca488610e00000000000000000005c0750000000000000000000000000000000000000000000000000000000000000000000001503054427b004747e8746cddb33b0f7f95a90f89f89fb387cbb67b226e616d65223a226d796e616d65222c226c6162656c223a226d796c6162656c222c227469746c65223a22636f6e74656e74207469746c65222c2274797065223a226d61726b646f776e222c22626f6479223a22636f6e74656e7420626f6479227d'
  let privkey = Privkey().fromBN(BN(5))
  let keypair = Keypair().fromPrivkey(privkey)
  let address = Address().fromPubkey(keypair.pubkey)
  let contenthex = '7b226e616d65223a226d796e616d65222c226c6162656c223a226d796c6162656c222c227469746c65223a22636f6e74656e74207469746c65222c2274797065223a226d61726b646f776e222c22626f6479223a22636f6e74656e7420626f6479227d'
  let contentbuf = new Buffer(contenthex, 'hex')
  let blockidhex = '00000000000000000e6188a4cc93e3d3244b20bfdef1e9bd9db932e30f3aa2f1'
  let blockhashbuf = BR(new Buffer(blockidhex, 'hex')).readReverse()
  let blockheightnum = 376949

  it('should exist', function () {
    should.exist(ContentAuth)
    should.exist(ContentAuth())
  })

  describe('#toHex', function () {
    it('should convert to hex', function () {
      let contentauth = ContentAuth()
      contentauth.fromObject({
        blockhashbuf: blockhashbuf,
        blockheightnum: blockheightnum,
        date: new Date(1443919839867),
        address: address,
        contentbuf: contentbuf
      })
      contentauth.sign(keypair)
      contentauth.sig = ECDSA.calcrecovery(contentauth.sig, contentauth.pubkey, Hash.sha256(contentauth.getBufForSig()))
      contentauth.toHex().should.equal(contentauthhex)
    })
  })

  describe('#fromHex', function () {
    it('should convert from hex to this known value', function () {
      let contentauth = ContentAuth().fromHex(contentauthhex)
      should.exist(contentauth.sig)
      should.exist(contentauth.pubkey)
      should.exist(contentauth.blockhashbuf)
      should.exist(contentauth.blockheightnum)
      should.exist(contentauth.parenthashbuf)
      should.exist(contentauth.date)
      should.exist(contentauth.address)
      should.exist(contentauth.contentbuf)
    })
  })

  describe('#sign', function () {
    it('should sign this value and get the same thing back', function () {
      let contentauth = ContentAuth().fromHex(contentauthhex)
      contentauth.sign(keypair)
      contentauth.toHex().should.equal(contentauthhex)
    })
  })

  describe('#verify', function () {
    it('should sign this value and get the same thing back', function () {
      let contentauth = ContentAuth().fromHex(contentauthhex)
      contentauth.verify().should.equal(true)
    })
  })
})
