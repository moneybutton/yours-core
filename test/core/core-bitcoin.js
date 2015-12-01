/* global describe,it,before,after */
'use strict'
let Address = require('fullnode/lib/address')
let CoreBitcoin = require('../../core/core-bitcoin')
let DB = require('../../core/db')
let User = require('../../core/user')
let asink = require('asink')
let should = require('should')
let sinon = require('sinon')

describe('CoreBitcoin', function () {
  let db = DB('datt-testdatabase')
  let corebitcoin = CoreBitcoin(undefined, db)

  before(function () {
    return asink(function *() {
      yield db.asyncInitialize()
      yield corebitcoin.asyncInitialize()
    })
  })

  after(function () {
    return db.asyncDestroy()
  })

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

  describe('#asyncGetAllExtAddresses', function () {
    it('should get addresses', function () {
      return asink(function *() {
        let user = yield User().asyncFromRandom()
        let corebitcoin = CoreBitcoin().fromUser(user)
        corebitcoin.dbbip44wallet = {
          asyncSave: () => Promise.resolve()
        }
        yield corebitcoin.asyncGetNewExtAddress()
        yield corebitcoin.asyncGetNewExtAddress()
        yield corebitcoin.asyncGetNewIntAddress()
        let addresses = yield corebitcoin.asyncGetAllExtAddresses(0)
        addresses.length.should.equal(2)
      })
    })
  })

  describe('#asyncGetExtAddress', function () {
    it('should get an address', function () {
      return asink(function *() {
        let address = yield corebitcoin.asyncGetExtAddress(0)
        let address2 = yield corebitcoin.asyncGetExtAddress(0)
        let address3 = yield corebitcoin.asyncGetExtAddress(15)
        ;(address instanceof Address).should.equal(true)
        address.toString().should.equal(address2.toString())
        address.toString().should.not.equal(address3.toString())
      })
    })
  })

  describe('#asyncGetNewExtAddress', function () {
    it('should get a new address', function () {
      return asink(function *() {
        let address = yield corebitcoin.asyncGetNewExtAddress()
        ;(address instanceof Address).should.equal(true)
      })
    })
  })

  describe('#asyncGetAllIntAddresses', function () {
    it('should get addresses', function () {
      return asink(function *() {
        let user = yield User().asyncFromRandom()
        let corebitcoin = CoreBitcoin().fromUser(user)
        corebitcoin.dbbip44wallet = {
          asyncSave: () => Promise.resolve()
        }
        yield corebitcoin.asyncGetNewExtAddress()
        yield corebitcoin.asyncGetNewExtAddress()
        yield corebitcoin.asyncGetNewIntAddress()
        let addresses = yield corebitcoin.asyncGetAllIntAddresses(0)
        addresses.length.should.equal(1)
      })
    })
  })

  describe('#asyncGetNewIntAddress', function () {
    it('should get a new address', function () {
      return asink(function *() {
        let address = yield corebitcoin.asyncGetNewIntAddress()
        ;(address instanceof Address).should.equal(true)
      })
    })
  })

  describe('#asyncGetLatestBlockInfo', function () {
    it('should call blockchainAPI.asyncGetLatestBlockInfo', function () {
      return asink(function *() {
        let corebitcoin = CoreBitcoin()
        corebitcoin.blockchainAPI.asyncGetLatestBlockInfo = sinon.spy()
        yield corebitcoin.asyncGetLatestBlockInfo()
        corebitcoin.blockchainAPI.asyncGetLatestBlockInfo.calledOnce.should.equal(true)
      })
    })
  })
})
