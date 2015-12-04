/* global describe,it */
'use strict'
let Address = require('fullnode/lib/address')
let BlockchainAPI = require('../../core/blockchain-api')
let asink = require('asink')
let should = require('should')

describe('BlockchainAPI', function () {
  this.timeout(5000)

  it('should exist', function () {
    should.exist(BlockchainAPI)
    should.exist(BlockchainAPI())
  })

  describe('#asyncGetLatestBlockInfo', function () {
    it('should make a real request and get the latest block info (if this test times out, it could be that the public Insight server is down)', function () {
      return asink(function *() {
        let info = yield BlockchainAPI().asyncGetLatestBlockInfo()
        should.exist(info.idbuf)
        should.exist(info.idhex)
        should.exist(info.hashbuf)
        should.exist(info.hashhex)
        should.exist(info.height)
      }.bind(this))
    })
  })

  describe('#asyncGetUTXOsJSON', function () {
    it('should get utxos for this known address', function () {
      return asink(function *() {
        // This is one of Satoshi's addresses. It is in the Coinbase output of
        // the second block. It mined 50 BTC, however people have since added
        // more bitcoins to it, so the balance is a little greater than 50 BTC.
        let address = Address().fromString('12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX')
        let utxos = yield BlockchainAPI().asyncGetUTXOsJSON([address])
        utxos.length.should.greaterThan(26)
      }.bind(this))
    })
  })

  describe('#asyncGetAddressesBalancesSatoshis', function () {
    it('should get balances for this known address', function () {
      return asink(function *() {
        let address1 = Address().fromString('12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX')
        let address2 = Address().fromString('1MUSZkXpQE3mq6Hq3LpUrvmapKFkguTc3N')
        let balances = yield BlockchainAPI().asyncGetAddressesBalancesSatoshis([address1, address2])
        balances.confirmedBalanceSatoshis.should.greaterThan(50 * 1e8)
        balances.unconfirmedBalanceSatoshis.should.greaterThan(-1)
        balances.totalBalanceSatoshis.should.greaterThan(50 * 1e8)
      }.bind(this))
    })
  })

  describe('#asyncGetAddressConfirmedBalanceSatoshis', function () {
    it('should return balance of this known address', function () {
      return asink(function *() {
        // This is one of Satoshi's addresses. It is in the Coinbase output of
        // the second block. It mined 50 BTC, however people have since added
        // more bitcoins to it, so the balance is a little greater than 50 BTC.
        let address = Address().fromString('12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX')
        let satoshis = yield BlockchainAPI().asyncGetAddressConfirmedBalanceSatoshis(address)
        satoshis.should.greaterThan(50 * 1e8)
      })
    })
  })

  describe('#asyncGetAddressUnconfirmedBalanceSatoshis', function () {
    it('should return balance of this known address', function () {
      return asink(function *() {
        // This is one of Satoshi's addresses. It is in the Coinbase output of
        // the second block. It mined 50 BTC, however people have since added
        // more bitcoins to it, so the balance is a little greater than 50 BTC.
        let address = Address().fromString('12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX')
        let satoshis = yield BlockchainAPI().asyncGetAddressUnconfirmedBalanceSatoshis(address)
        satoshis.should.greaterThan(-1)
      })
    })
  })

  describe('#asyncGetAddressTotalBalanceSatoshis', function () {
    it('should return balance of this known address', function () {
      return asink(function *() {
        // This is one of Satoshi's addresses. It is in the Coinbase output of
        // the second block. It mined 50 BTC, however people have since added
        // more bitcoins to it, so the balance is a little greater than 50 BTC.
        let address = Address().fromString('12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX')
        let satoshis = yield BlockchainAPI().asyncGetAddressTotalBalanceSatoshis(address)
        satoshis.should.greaterThan(50 * 1e8)
      })
    })
  })
})
