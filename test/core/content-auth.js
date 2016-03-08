/* global describe,it */
'use strict'
let Address = require('fullnode/lib/address')
let BN = require('fullnode/lib/bn')
let BR = require('fullnode/lib/br')
let Content = require('../../core/content')
let ContentAuth = require('../../core/content-auth')
let Hash = require('fullnode/lib/hash')
let Keypair = require('fullnode/lib/keypair')
let Privkey = require('fullnode/lib/privkey')
let should = require('should')
let asink = require('asink')

describe('ContentAuth', function () {
  let contentauthhex = '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4206f508d5924d60521a3f8ae280934e2f4f67860435a377cd390ab8b2ac6aa72a1652e81e0be8e9c80d753706486ef2e65c1229ab57e13c547e07a6927c2bc83b3f1a23a0fe332b99dbde9f1debf204b24d3e393cca488610e00000000000000000005c0750000000000000000000000000000000000000000000000000000000000000000000001503054427b004747e8746cddb33b0f7f95a90f89f89fb387cbb67b226e616d65223a226d796e616d65222c226c6162656c223a226d796c6162656c222c227469746c65223a22636f6e74656e74207469746c65222c2274797065223a226d61726b646f776e222c22626f6479223a22636f6e74656e7420626f6479227d'
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

  describe('#setAddressFromPubkey', function () {
    it('should derive and set an address from the provided public key using Address().fromPubkey', function () {
      return asink(function *() {
        let contentauth = ContentAuth().fromHex(contentauthhex)
        let keypair = Keypair().fromRandom()
        let pubkey = keypair.pubkey
        let expectedAddress = Address().fromPubkey(pubkey)
        let address = yield contentauth.setAddressFromPubkey(pubkey)
        should.exist(address)
        should.exist(address.hashbuf)
        should.exist(contentauth.address)
        should.exist(contentauth.address.hashbuf)
        expectedAddress.hashbuf.toString('hex').should.equal(address.hashbuf.toString('hex'))
        expectedAddress.hashbuf.toString('hex').should.equal(contentauth.address.hashbuf.toString('hex'))
      })
    })
  })

  describe('#sign', function () {
    it('should sign this value and get the same thing back', function () {
      let contentauth = ContentAuth().fromHex(contentauthhex)
      contentauth.sign(keypair)
      contentauth.toHex().should.equal(contentauthhex)
    })
  })

  describe('#asyncSign', function () {
    it('should result the same as #sign', function () {
      return asink(function *() {
        let contentauth = ContentAuth().fromHex(contentauthhex)
        let sig = yield contentauth.asyncSign(keypair)
        sig.toHex().should.equal(contentauth.sign(keypair).toHex())
      })
    })
  })

  describe('#verify', function () {
    it('should sign this value and get the same thing back', function () {
      let contentauth = ContentAuth().fromHex(contentauthhex)
      contentauth.verify().should.equal(true)
    })
  })

  describe('#asyncVerify', function () {
    it('should return the same as #verify', function () {
      return asink(function *() {
        let contentauth = ContentAuth().fromHex(contentauthhex)
        let verified = yield contentauth.asyncVerify()
        verified.should.equal(contentauth.verify())
      })
    })
  })

  describe('#asyncValidate', function () {
    it('should return the same as #verify', function () {
      return asink(function *() {
        let errors = 0
        let contentauth = ContentAuth().fromHex(contentauthhex)
        try {
          yield contentauth.asyncValidate()
        } catch (err) {
          errors++
        }
        errors.should.equal(0)
      })
    })
  })

  describe('#setContent', function () {
    it('should set the content', function () {
      let contentauth = ContentAuth().fromHex(contentauthhex)
      let content = Content().fromObject({
        name: 'satoshi',
        label: 'general',
        title: 'title',
        type: 'markdown',
        body: 'body'
      })
      contentauth.setContent(content)
      contentauth.contentbuf.toString('hex').should.equal(content.toBuffer().toString('hex'))
    })
  })

  describe('#getContent', function () {
    it('should get content', function () {
      let contentauth = ContentAuth().fromHex(contentauthhex)
      let content = contentauth.getContent()
      ;(content instanceof Content).should.equal(true)
      should.exist(content.name)
      should.exist(content.label)
      should.exist(content.title)
      should.exist(content.type)
      should.exist(content.body)
    })
  })

  describe('#setCacheHash', function () {
    it('should set cachehash', function () {
      let contentauth = ContentAuth().fromHex(contentauthhex)
      let hashbuf = Hash.sha256(contentauth.toBuffer())
      contentauth.setCacheHash(hashbuf)
      should.exist(contentauth.cachehash)
      contentauth.cachehash.should.equal(hashbuf)
    })
  })

  describe('#getCacheHash', function () {
    it('should get cachehash', function () {
      let contentauth = ContentAuth().fromHex(contentauthhex)
      let hashbuf = Hash.sha256(contentauth.toBuffer())
      contentauth.setCacheHash(hashbuf)
      should.exist(contentauth.cachehash)
      contentauth.getCacheHash().should.equal(hashbuf)
    })
  })

  describe('#asyncGetHash', function () {
    it('should return the hash of the contentauth', function () {
      return asink(function *() {
        let contentauth = ContentAuth().fromHex(contentauthhex)
        let hashbuf = yield contentauth.asyncGetHash(contentauth)
        Buffer.compare(hashbuf, Hash.sha256(contentauth.toBuffer())).should.equal(0)
      })
    })
  })
})
