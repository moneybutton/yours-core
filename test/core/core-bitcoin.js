/* global describe,it */
'use strict'
let CoreBitcoin = require('../../core/core-bitcoin')
let Address = require('fullnode/lib/address')
let User = require('../../core/user')
let asink = require('asink')
let should = require('should')

describe('CoreBitcoin', function () {
  it('should exist', function () {
    should.exist(CoreBitcoin)
    should.exist(CoreBitcoin())
  })

  describe('#fromUser', function () {
    it('should set known properties', function () {
      return asink(function *() {
        let user = yield User().asyncFromRandom()
        let corebitcoin = CoreBitcoin().fromUser(user)
        should.exist(corebitcoin.bip44wallet)
        should.exist(corebitcoin.bip44wallet.mnemonic)
        should.exist(corebitcoin.bip44wallet.masterxprv)
        should.exist(corebitcoin.bip44wallet.masterxpub)
      })
    })
  })

  describe('#asyncGetNewAddress', function () {
    it('should get a new address', function () {
      return asink(function *() {
        let corebitcoin = yield CoreBitcoin().asyncFromRandom()
        let address = yield corebitcoin.asyncGetNewAddress()
        ;(address instanceof Address).should.equal(true)
      })
    })
  })

  describe('#asyncGetNewChangeAddress', function () {
    it('should get a new address', function () {
      return asink(function *() {
        let corebitcoin = yield CoreBitcoin().asyncFromRandom()
        let address = yield corebitcoin.asyncGetNewChangeAddress()
        ;(address instanceof Address).should.equal(true)
      })
    })
  })

  describe('#asyncGetLatestBlockInfo', function () {
    it('should return block info', function () {
      return asink(function *() {
        let corebitcoin = CoreBitcoin()
        let info = yield corebitcoin.asyncGetLatestBlockInfo()
        should.exist(info.idbuf)
        should.exist(info.idhex)
        should.exist(info.hashbuf)
        should.exist(info.hashhex)
        should.exist(info.height)
      })
    })
  })
})
