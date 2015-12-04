/* global describe,it */
'use strict'
let Address = require('fullnode/lib/address')
let BlockchainAPI = require('../../core/blockchain-api')
let asink = require('asink')
let should = require('should')

describe('BlockchainAPI', function () {
  it('should exist', function () {
    should.exist(BlockchainAPI)
    should.exist(BlockchainAPI())
  })

  describe('#asyncGetLatestBlockInfo', function () {
    it('should make a real request and get the latest block info (if this test times out, it could be that the public Insight server is down)', function () {
      this.timeout(5000)
      return asink(function *() {
        let info = yield BlockchainAPI().asyncGetLatestBlockInfo()
        should.exist(info.idbuf)
        should.exist(info.idhex)
        should.exist(info.hashbuf)
        should.exist(info.hashhex)
        should.exist(info.height)
      })
    })
  })

  describe('#asyncGetConfirmedBalanceSatoshis', function () {
    it('should return balance of this known address', function () {
      return asink(function *() {
        // This is one of Satoshi's addresses. It is in the Coinbase output of
        // the second block. It mined 50 BTC, however people have since added
        // more bitcoins to it, so the balance is a little greater than 50 BTC.
        let address = Address().fromString('12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX')
        let satoshis = yield BlockchainAPI().asyncGetConfirmedBalanceSatoshis(address)
        satoshis.should.greaterThan(50 * 1e8)
      })
    })
  })

  describe('#asyncGetUnconfirmedBalanceSatoshis', function () {
    it('should return balance of this known address', function () {
      return asink(function *() {
        // This is one of Satoshi's addresses. It is in the Coinbase output of
        // the second block. It mined 50 BTC, however people have since added
        // more bitcoins to it, so the balance is a little greater than 50 BTC.
        let address = Address().fromString('12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX')
        let satoshis = yield BlockchainAPI().asyncGetUnconfirmedBalanceSatoshis(address)
        satoshis.should.greaterThan(-1)
      })
    })
  })

  describe('#asyncGetTotalBalanceSatoshis', function () {
    it('should return balance of this known address', function () {
      return asink(function *() {
        // This is one of Satoshi's addresses. It is in the Coinbase output of
        // the second block. It mined 50 BTC, however people have since added
        // more bitcoins to it, so the balance is a little greater than 50 BTC.
        let address = Address().fromString('12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX')
        let satoshis = yield BlockchainAPI().asyncGetTotalBalanceSatoshis(address)
        satoshis.should.greaterThan(50 * 1e8)
      })
    })
  })
})
