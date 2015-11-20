/* global describe,it,before,after */
'use strict'
let Address = require('fullnode/lib/address')
let CoreBitcoin = require('../../core/core-bitcoin')
let DB = require('../../core/db')
let User = require('../../core/user')
let asink = require('asink')
let should = require('should')

describe('CoreBitcoin', function () {
  let db = DB('datt-testdatabase')
  let corebitcoin = CoreBitcoin(db)

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

  describe('#asyncGetNewAddress', function () {
    it('should get a new address', function () {
      return asink(function *() {
        let address = yield corebitcoin.asyncGetNewAddress()
        ;(address instanceof Address).should.equal(true)
      })
    })
  })

  describe('#asyncGetNewChangeAddress', function () {
    it('should get a new address', function () {
      return asink(function *() {
        let address = yield corebitcoin.asyncGetNewChangeAddress()
        ;(address instanceof Address).should.equal(true)
      })
    })
  })

  describe('#asyncGetLatestBlockInfo', function () {
    it('should return block info', function () {
      return asink(function *() {
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
