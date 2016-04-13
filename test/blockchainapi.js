/* global Fullnode,describe,it */
'use strict'
let Privkey = Fullnode.Privkey
let Pubkey = Fullnode.Pubkey
let Address = Fullnode.Address
let BlockchainAPI = require('../lib/blockchainapi')
let Tx = require('fullnode/lib/tx')
let asink = require('asink')
let should = require('should')

describe('BlockchainAPI', function () {
  // Because these tests make actual live calls over the internet to a
  // blockchain API, we need to lengthen the timeout, because sometimes things
  // go slow. Long-term, we hope to replace the blockchain API with
  // SPV-in-a-browser, but for now we must deal with this.
  this.timeout(7500)

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
        utxos.length.should.greaterThan(20)
      }, this)
    })
  })

  describe('#asyncGetBlockchainPayerAddresses', function () {
    it('should get no payer addresses for a new address', function () {
      return asink(function *() {
        let privKey = Privkey().fromRandom()
        let pubKey = Pubkey().fromPrivkey(privKey)
        let address = Address().fromPubkey(pubKey)
        let addresses = yield BlockchainAPI().asyncGetBlockchainPayerAddresses(address)
        addresses.length.should.equal(0)
      }, this)
    })

    it('should get payer addresses for this known address', function () {
      return asink(function *() {
        let address = Address().fromString('1DYJLdYrC4mWTH6YcDTJ6NqnMzfDE4aFeZ')
        let addresses = yield BlockchainAPI().asyncGetBlockchainPayerAddresses(address)
        addresses.length.should.greaterThan(1)
        ;(addresses[0] instanceof Address).should.equal(true)
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

  describe('#asyncGetAddressesIndividualBalancesSatoshis', function () {
    it('should get balances for these known addresses', function () {
      return asink(function *() {
        let address1 = Address().fromString('12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX')
        let address2 = Address().fromString('1MUSZkXpQE3mq6Hq3LpUrvmapKFkguTc3N')
        let balances = yield BlockchainAPI().asyncGetAddressesIndividualBalancesSatoshis([address1, address2])
        balances[0].confirmedBalanceSatoshis.should.greaterThan(-1)
        balances[0].unconfirmedBalanceSatoshis.should.greaterThan(-1)
        balances[0].totalBalanceSatoshis.should.greaterThan(-1)
        balances[1].confirmedBalanceSatoshis.should.greaterThan(-1)
        balances[1].unconfirmedBalanceSatoshis.should.greaterThan(-1)
        balances[1].totalBalanceSatoshis.should.greaterThan(-1)
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
        let txhex = '010000000168a59c95a89ed5e9af00e90a7823156b02b7811000c63170bb2440d8db6a1869000000008a473044022050c32cf6cd888178268701a636b189dc3f026ee3ebd230fd77018e54044aac77022055aa7fa73c524dd4f0be02694683a21eb03d5d2f2c519d7dc7110b742c417517014104aa5c77986a87b93b03d949013e629601b6dbdbd5fc09f3bef9263b64b3c38d79d443fafa2fbf422a203fe433adf6e071f3172a53747739ce72c640fe7e514981ffffffff0140420f00000000001976a91449cf380abdb86449efc694988bf0f447739f73cd88ac00000000'
        let txb = {
          tx: Tx().fromHex(txhex)
        }
        let errors = 0
        try {
          yield BlockchainAPI().asyncSendTransaction(txb)
        } catch (err) {
          errors++
          err.body.includes('transaction already in block chain').should.equal(true)
        }
        errors.should.equal(1)
      }, this)
    })
  })
})
