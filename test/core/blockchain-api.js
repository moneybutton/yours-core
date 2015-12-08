/* global describe,it */
'use strict'
let Address = require('fullnode/lib/address')
let BlockchainAPI = require('../../core/blockchain-api')
let Tx = require('fullnode/lib/tx')
let asink = require('asink')
let should = require('should')

describe('BlockchainAPI', function () {
  // Because these tests make actual live calls over the internet to a
  // blockchain API, we need to lengthen the timeout, because sometimes things
  // go slow. Long-term, we hope to replace the blockchain API with
  // SPV-in-a-browser, but for now we must deal with this.
  this.timeout(5000)

  it('should exist', function () {
    should.exist(BlockchainAPI)
    should.exist(BlockchainAPI())
  })

  describe('#asyncGetLatestBlockInfo', function () {
    it('should make a real request and get the latest block info (if this test times out, it could be that the public Insight server is down)', function () {
      return asink(function *() {
        this.timeout(10000)
        let info = yield BlockchainAPI().asyncGetLatestBlockInfo()
        should.exist(info.idbuf)
        should.exist(info.idhex)
        should.exist(info.hashbuf)
        should.exist(info.hashhex)
        should.exist(info.height)
      }, this)
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
      }, this)
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
      }, this)
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
      }, this)
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
      }, this)
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
      }, this)
    })
  })

  describe('#asyncSendTransaction', function () {
    it('should fail when broadcasting tx already in the blockchain', function () {
      return asink(function *() {
        let txhex = '0100000001792d8bf46091200f76960aa0dbd6884191a7a2f55066bbc65322e6a7da0d2f62000000006a4730440220070d849fa9b6e0053ca47eb4dbb5232848585f1ce8c446a903e73d76b3817e8d02201dbaccc40c16d71232d3ba3b0224d9cc8b7aae8cfc3921ea8b2fd65beaa18b2e01210220c4fecd165305d4e90640fd09d6da06e619cfed87d9a30a9bb80c719b0ce3d9feffffff0200c2eb0b000000001976a914ef1167154c85b5345a026f08d2e90b79354bf19d88ac0f473d25000000001976a914621586964aa9ac26d9f031886c8d14d4325a43ac88ac19e90500'
        let txb = {
          tx: Tx().fromHex(txhex)
        }
        let errors = 0
        try {
          yield BlockchainAPI().asyncSendTransaction(txb)
        } catch (err) {
          errors++
          err.statusCode.should.equal(400)
        }
        errors.should.equal(1)
      }, this)
    })
  })
})
