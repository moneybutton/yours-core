/* global describe,it */
'use strict'
let BIP44Account = require('../../core/bip44-account')
let BIP32 = require('fullnode/lib/bip32')
let should = require('should')
let asink = require('asink')

describe('BIP44Account', function () {
  it('should exist', function () {
    should.exist(BIP44Account)
    should.exist(BIP44Account())
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
        bip32 = bip32.toPublic()
        bip44account = BIP44Account(bip32)
        keys = yield bip44account.asyncDeriveKeysFromPath('m/0')
        should.not.exist(keys.xprv)
        should.exist(keys.xpub)
        should.exist(keys.address)
      })
    })
  })

  describe('#asyncGetAddressKeys', function () {
    it('should derive next address', function () {
      return asink(function *() {
        let bip32 = BIP32().fromRandom()
        let bip44account = BIP44Account(bip32)
        let keys = yield bip44account.asyncGetAddressKeys(0)
        should.exist(keys.xprv)
        should.exist(keys.xpub)
        should.exist(keys.address)
      })
    })
  })

  describe('#asyncGetNextAddressKeys', function () {
    it('should derive next address', function () {
      return asink(function *() {
        let bip32 = BIP32().fromRandom()
        let bip44account = BIP44Account(bip32)
        let keys = yield bip44account.asyncGetNextAddressKeys()
        should.exist(keys.xprv)
        should.exist(keys.xpub)
        should.exist(keys.address)
        let keys2 = yield bip44account.asyncGetNextAddressKeys()
        keys2.xprv.toString().should.not.equal(keys.xprv.toString())
      })
    })
  })

  describe('#asyncGetChangeKeys', function () {
    it('should derive next address', function () {
      return asink(function *() {
        let bip32 = BIP32().fromRandom()
        let bip44account = BIP44Account(bip32)
        let keys = yield bip44account.asyncGetChangeKeys(0)
        should.exist(keys.xprv)
        should.exist(keys.xpub)
        should.exist(keys.address)
      })
    })
  })

  describe('#asyncGetNextChangeKeys', function () {
    it('should derive next address', function () {
      return asink(function *() {
        let bip32 = BIP32().fromRandom()
        let bip44account = BIP44Account(bip32)
        let keys = yield bip44account.asyncGetNextChangeKeys()
        should.exist(keys.xprv)
        should.exist(keys.xpub)
        should.exist(keys.address)
        let keys2 = yield bip44account.asyncGetNextChangeKeys()
        keys2.xprv.toString().should.not.equal(keys.xprv.toString())
      })
    })
  })
})
