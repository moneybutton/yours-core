/* global describe,it */
'use strict'
let BIP44Account = require('../../core/bip44-account')
let BIP32 = fullnode.BIP32
let should = require('should')
let asink = require('asink')

describe('BIP44Account', function () {
  it('should exist', function () {
    should.exist(BIP44Account)
    should.exist(BIP44Account())
  })

  describe('#asyncFromMasterXprvPrivate', function () {
    it('should derive this known bip32', function () {
      return asink(function *() {
        let seedbuf = new Buffer(128 / 8)
        seedbuf.fill(0)
        let bip32 = BIP32().fromSeed(seedbuf)
        let bip44account = yield BIP44Account().asyncFromMasterXprvPrivate(bip32, 0)
        bip44account.bip32.toString().should.equal('xprv9xyY3BxueQiNtW3y1nu26cGxjXV42TAyXFEE31TV2ejPvnb2ncvT4R7vAHDtbJRAhounY1VDVJLnYfqn6WyUASd27DjySS1DWbTaeEhDEVU')
      })
    })
  })

  describe('#asyncFromMasterXprvPublic', function () {
    it('should derive this known bip32', function () {
      return asink(function *() {
        let seedbuf = new Buffer(128 / 8)
        seedbuf.fill(0)
        let bip32 = BIP32().fromSeed(seedbuf)
        let bip44account = yield BIP44Account().asyncFromMasterXprvPublic(bip32, 0)
        bip44account.bip32.toString().should.equal('xpub6BxtShVoUnGg6z8S7pS2TkDhHZKYRutptU9pqPs6azGNoavBLAEhcDSQ1YwynAShE2c44ShKzAAxoAa1gwtHgaks6DYTiUzyZAp4qDf4czA')
      })
    })
  })

  describe('#toJSON', function () {
    it('should return this known json', function () {
      return asink(function *() {
        let seedbuf = new Buffer(128 / 8)
        seedbuf.fill(0)
        let bip32 = BIP32().fromSeed(seedbuf)
        let bip44account = BIP44Account(bip32)
        yield bip44account.asyncGetNextIntAddressKeys()
        yield bip44account.asyncGetNextExtAddressKeys()
        yield bip44account.asyncGetNextExtAddressKeys()
        let json = bip44account.toJSON()
        json.extindex.should.equal(1)
        json.intindex.should.equal(0)
        Object.keys(json.pathmap).length.should.equal(3)
      })
    })
  })

  describe('#fromJSON', function () {
    it('should do a round trip with toJSON', function () {
      return asink(function *() {
        let seedbuf = new Buffer(128 / 8)
        seedbuf.fill(0)
        let bip32 = BIP32().fromSeed(seedbuf)
        let bip44account = BIP44Account(bip32)
        yield bip44account.asyncGetNextIntAddressKeys()
        yield bip44account.asyncGetNextExtAddressKeys()
        yield bip44account.asyncGetNextExtAddressKeys()
        let json = bip44account.toJSON()
        let bip44account2 = BIP44Account().fromJSON(json)
        bip44account.extindex.should.equal(bip44account2.extindex)
        bip44account.intindex.should.equal(bip44account2.intindex)
        bip44account.pathmap.size.should.equal(bip44account2.pathmap.size)
        bip44account.addrhexmap.size.should.equal(bip44account2.pathmap.size)
      })
    })
  })

  describe('#isPrivate', function () {
    it('should know if the bip32 does or does not have the privkey', function () {
      let bip32 = BIP32().fromRandom()
      let bip44account = BIP44Account(bip32)
      bip44account.isPrivate().should.equal(true)
      bip32 = bip32.toPublic()
      bip44account = BIP44Account(bip32)
      bip44account.isPrivate().should.equal(false)
    })
  })

  describe('#asyncDeriveKeysFromPath', function () {
    it('should derive keys', function () {
      return asink(function *() {
        let bip32 = BIP32().fromRandom()
        let bip44account = BIP44Account(bip32)
        let keys = yield bip44account.asyncDeriveKeysFromPath('m/0')
        should.exist(keys.xprv)
        should.exist(keys.xpub)
        should.exist(keys.address)

        // test that addrhexmap exists
        keys = bip44account.addrhexmap.get(keys.address.toHex())
        should.exist(keys.xprv)
        should.exist(keys.xpub)
        should.exist(keys.address)

        // test that toPublic works
        bip32 = bip32.toPublic()
        bip44account = BIP44Account(bip32)
        keys = yield bip44account.asyncDeriveKeysFromPath('m/0')
        should.not.exist(keys.xprv)
        should.exist(keys.xpub)
        should.exist(keys.address)
      })
    })
  })

  describe('#asyncGetAllExtAddresses', function () {
    it('should return all addresses', function () {
      return asink(function *() {
        let bip32 = BIP32().fromRandom()
        let bip44account = BIP44Account(bip32)
        yield bip44account.asyncGetNextExtAddressKeys()
        yield bip44account.asyncGetNextExtAddressKeys()
        yield bip44account.asyncGetNextExtAddressKeys()
        yield bip44account.asyncGetNextIntAddressKeys()
        yield bip44account.asyncGetNextIntAddressKeys()
        let addresses = yield bip44account.asyncGetAllExtAddresses()
        addresses.length.should.equal(3)
      })
    })
  })

  describe('#asyncGetAllChangeAddresses', function () {
    it('should return all addresses', function () {
      return asink(function *() {
        let bip32 = BIP32().fromRandom()
        let bip44account = BIP44Account(bip32)
        yield bip44account.asyncGetNextExtAddressKeys()
        yield bip44account.asyncGetNextExtAddressKeys()
        yield bip44account.asyncGetNextExtAddressKeys()
        yield bip44account.asyncGetNextIntAddressKeys()
        yield bip44account.asyncGetNextIntAddressKeys()
        let addresses = yield bip44account.asyncGetAllIntAddresses()
        addresses.length.should.equal(2)
      })
    })
  })

  describe('#asyncGetExtAddressKeys', function () {
    it('should derive next address', function () {
      return asink(function *() {
        let bip32 = BIP32().fromRandom()
        let bip44account = BIP44Account(bip32)
        let keys = yield bip44account.asyncGetExtAddressKeys(0)
        should.exist(keys.xprv)
        should.exist(keys.xpub)
        should.exist(keys.address)
      })
    })
  })

  describe('#asyncGetNextExtAddressKeys', function () {
    it('should derive next address', function () {
      return asink(function *() {
        let bip32 = BIP32().fromRandom()
        let bip44account = BIP44Account(bip32)
        let keys = yield bip44account.asyncGetNextExtAddressKeys()
        should.exist(keys.xprv)
        should.exist(keys.xpub)
        should.exist(keys.address)
        let keys2 = yield bip44account.asyncGetNextExtAddressKeys()
        keys2.xprv.toString().should.not.equal(keys.xprv.toString())
      })
    })
  })

  describe('#asyncGetIntAddressKeys', function () {
    it('should derive next address', function () {
      return asink(function *() {
        let bip32 = BIP32().fromRandom()
        let bip44account = BIP44Account(bip32)
        let keys = yield bip44account.asyncGetIntAddressKeys(0)
        should.exist(keys.xprv)
        should.exist(keys.xpub)
        should.exist(keys.address)
      })
    })
  })

  describe('#asyncGetNextIntAddressKeys', function () {
    it('should derive next address', function () {
      return asink(function *() {
        let bip32 = BIP32().fromRandom()
        let bip44account = BIP44Account(bip32)
        let keys = yield bip44account.asyncGetNextIntAddressKeys()
        should.exist(keys.xprv)
        should.exist(keys.xpub)
        should.exist(keys.address)
        let keys2 = yield bip44account.asyncGetNextIntAddressKeys()
        keys2.xprv.toString().should.not.equal(keys.xprv.toString())
        let keys3 = yield bip44account.asyncGetNextExtAddressKeys()
        keys3.xprv.toString().should.not.equal(keys.xprv.toString())
      })
    })
  })
})
