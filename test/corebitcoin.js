/* global Fullnode,describe,it,before,after */
'use strict'
let Address = Fullnode.Address
let BIP44Wallet = require('../lib/bip44wallet')
let CoreBitcoin = require('../lib/corebitcoin')
let DB = require('../lib/db')
let DBBIP44Wallet = require('../lib/dbbip44wallet')
let Interp = Fullnode.Interp
let Txverifier = Fullnode.Txverifier
let Txbuilder = Fullnode.Txbuilder
let User = require('../lib/user')
let asink = require('asink')
let should = require('should')
let sinon = require('sinon')

describe('CoreBitcoin', function () {
  let db = DB('datt-testdatabase')
  let corebitcoin = CoreBitcoin(undefined, db, DBBIP44Wallet(db))

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

  describe('#initialize', function () {
    it('should set some initial variables', function () {
      should.exist(corebitcoin.balances)
      should.exist(corebitcoin.balances.confirmedBalanceSatoshis)
      should.exist(corebitcoin.balances.unconfirmedBalanceSatoshis)
      should.exist(corebitcoin.balances.totalBalanceSatoshis)
    })
  })

  describe('#resetBalances', function () {
    it('should set balances to zero', function () {
      corebitcoin.resetBalances()
      corebitcoin.balances.confirmedBalanceSatoshis.should.equal(0)
      corebitcoin.balances.unconfirmedBalanceSatoshis.should.equal(0)
      corebitcoin.balances.totalBalanceSatoshis.should.equal(0)
    })
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

  describe('#unmonitorBlockchainAPI', function () {
    it('should set timeoutID to "unmonitor"', function () {
      let corebitcoin = CoreBitcoin()
      corebitcoin.unmonitorBlockchainAPI()
      corebitcoin.timeoutID.should.equal('unmonitor')
    })
  })

  describe('#asyncUpdateBalance', function () {
    it('should use blockchain API to get balance', function () {
      return asink(function *() {
        let corebitcoin = CoreBitcoin()
        corebitcoin.asyncGetAllAddresses = () => Promise.resolve([])
        corebitcoin.blockchainAPI = {
          asyncGetAddressesBalancesSatoshis: sinon.stub().returns(Promise.resolve({
            confirmedBalanceSatoshis: 100,
            unconfirmedBalanceSatoshis: 0,
            totalBalanceSatoshis: 100
          }))
        }
        corebitcoin.emit = sinon.spy()
        yield corebitcoin.asyncUpdateBalance()
        corebitcoin.blockchainAPI.asyncGetAddressesBalancesSatoshis.calledOnce.should.equal(true)
        corebitcoin.emit.calledOnce.should.equal(true)
      })
    })
  })

  describe('#asyncBuildTransaction', function () {
    it('should create a txbuilder object from mocked data', function () {
      return asink(function *() {
        let corebitcoin = CoreBitcoin()
        let bip44wallet = yield BIP44Wallet().asyncFromRandom()
        let bip44account = yield bip44wallet.asyncGetPrivateAccount(0)
        let keys = yield bip44account.asyncGetNextExtAddressKeys()

        corebitcoin.bip44wallet = bip44wallet
        corebitcoin.asyncGetAllAddresses = () => Promise.resolve([keys.address])
        corebitcoin.asyncGetNewIntAddress = () => Promise.resolve(keys.address)
        corebitcoin.blockchainAPI.asyncGetUTXOsJSON = () => Promise.resolve([
          {
            address: keys.address.toString(),
            txid: '0'.repeat(32 * 2),
            vout: 0,
            tx: 1449517728600,
            scriptPubKey: keys.address.toScript().toHex(),
            amount: 0.001,
            confirmations: 1
          }
        ])

        let toAddress = keys.address
        let toAmountSatoshis = 1000
        let txb = yield corebitcoin.asyncBuildTransaction([{toAddress, toAmountSatoshis}])
        ;(txb instanceof Txbuilder).should.equal(true)
      })
    })
  })

  describe('#asyncSignTransaction', function () {
    it('should create a txbuilder object from mocked data', function () {
      return asink(function *() {
        let corebitcoin = CoreBitcoin()
        let bip44wallet = yield BIP44Wallet().asyncFromRandom()
        let bip44account = yield bip44wallet.asyncGetPrivateAccount(0)
        let keys = yield bip44account.asyncGetNextExtAddressKeys()

        corebitcoin.bip44wallet = bip44wallet
        corebitcoin.asyncGetAllAddresses = () => Promise.resolve([keys.address])
        corebitcoin.asyncGetNewIntAddress = () => Promise.resolve(keys.address)
        corebitcoin.blockchainAPI.asyncGetUTXOsJSON = () => Promise.resolve([
          {
            address: keys.address.toString(),
            txid: '0'.repeat(32 * 2),
            vout: 0,
            tx: 1449517728600,
            scriptPubKey: keys.address.toScript().toHex(),
            amount: 0.001,
            confirmations: 1
          }
        ])

        let toAddress = keys.address
        let toAmountSatoshis = 1000
        let txb = yield corebitcoin.asyncBuildTransaction([{toAddress, toAmountSatoshis}])
        let txb2 = yield corebitcoin.asyncSignTransaction(txb)
        ;(txb2 instanceof Txbuilder).should.equal(true)
        Txverifier.verify(txb2.tx, txb2.utxoutmap, Interp.SCRIPT_VERIFY_P2SH).should.equal(true)
      })
    })
  })

  describe('#asyncSendTransaction', function () {
    it('should call blockchainAPI\'s asyncSendTransaction', function () {
      return asink(function *() {
        let corebitcoin = CoreBitcoin()
        corebitcoin.blockchainAPI = {
          asyncSendTransaction: sinon.stub().returns(Promise.resolve())
        }
        let txb = 'hello'
        yield corebitcoin.asyncSendTransaction(txb)
        corebitcoin.blockchainAPI.asyncSendTransaction.calledOnce.should.equal(true)
        corebitcoin.blockchainAPI.asyncSendTransaction.calledWith(txb).should.equal(true)
      }, this)
    })
  })

  describe('#asyncBuildSignAndSendTransaction', function () {
    it('should call other internal methods', function () {
      return asink(function *() {
        let corebitcoin = CoreBitcoin()
        corebitcoin.asyncBuildTransaction = sinon.stub().returns(Promise.resolve('hello'))
        corebitcoin.asyncSignTransaction = sinon.stub().returns(Promise.resolve('hello'))
        corebitcoin.asyncSendTransaction = sinon.spy()
        let txb = yield corebitcoin.asyncBuildSignAndSendTransaction()
        corebitcoin.asyncBuildTransaction.calledOnce.should.equal(true)
        corebitcoin.asyncSignTransaction.calledOnce.should.equal(true)
        corebitcoin.asyncSendTransaction.calledOnce.should.equal(true)
        txb.should.equal('hello')
      })
    })
  })

  describe('#asyncGetAllUTXOs', function () {
    it('should get all utxos with mocked calls', function () {
      return asink(function *() {
        let corebitcoin = CoreBitcoin()
        let bip44wallet = yield BIP44Wallet().asyncFromRandom()
        let bip44account = yield bip44wallet.asyncGetPrivateAccount(0)
        let keys = yield bip44account.asyncGetNextExtAddressKeys()

        corebitcoin.bip44wallet = bip44wallet
        corebitcoin.asyncGetAllAddresses = () => Promise.resolve([keys.address])
        corebitcoin.blockchainAPI.asyncGetUTXOsJSON = () => Promise.resolve([
          {
            address: keys.address.toString(),
            txid: '0'.repeat(32 * 2),
            vout: 0,
            tx: 1449517728600,
            scriptPubKey: keys.address.toScript().toHex(),
            amount: 0.001,
            confirmations: 1
          }
        ])

        let utxos = yield corebitcoin.asyncGetAllUTXOs()
        utxos.length.should.equal(1)
        should.exist(utxos[0].txhashbuf)
        should.exist(utxos[0].txoutnum)
        should.exist(utxos[0].txout)
        should.exist(utxos[0].pubkey)
      })
    })
  })

  describe('#asyncGetAllAddresses', function () {
    it('should get addresses', function () {
      return asink(function *() {
        let user = yield User().asyncFromRandom()
        let corebitcoin = CoreBitcoin().fromUser(user)
        corebitcoin.dbbip44wallet = {
          asyncRevHasChanged: () => Promise.resolve(false),
          asyncSave: () => Promise.resolve()
        }
        yield corebitcoin.asyncGetNewExtAddress()
        yield corebitcoin.asyncGetNewExtAddress()
        yield corebitcoin.asyncGetNewIntAddress()
        let addresses = yield corebitcoin.asyncGetAllAddresses()
        addresses.length.should.equal(3)
      })
    })
  })

  describe('#asyncGetAllExtAddresses', function () {
    it('should get addresses', function () {
      return asink(function *() {
        let user = yield User().asyncFromRandom()
        let corebitcoin = CoreBitcoin().fromUser(user)
        corebitcoin.dbbip44wallet = {
          asyncRevHasChanged: () => Promise.resolve(false),
          asyncSave: () => Promise.resolve()
        }
        yield corebitcoin.asyncGetNewExtAddress()
        yield corebitcoin.asyncGetNewExtAddress()
        yield corebitcoin.asyncGetNewIntAddress()
        let addresses = yield corebitcoin.asyncGetAllExtAddresses()
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

    it('should reload wallet if revision has changed', function () {
      return asink(function *() {
        let user = yield User().asyncFromRandom()
        let corebitcoin = CoreBitcoin(db, DBBIP44Wallet(db)).fromUser(user)
        corebitcoin.dbbip44wallet = {
          asyncGet: sinon.stub().returns(Promise.resolve(corebitcoin.bip44wallet)),
          asyncRevHasChanged: () => Promise.resolve(true),
          asyncSave: sinon.stub().returns(Promise.resolve())
        }
        yield corebitcoin.asyncGetExtAddress(0)
        corebitcoin.dbbip44wallet.asyncGet.calledOnce.should.equal(true)
      }, this)
    })
  })

  describe('#asyncGetNewExtAddress', function () {
    it('should get a new address', function () {
      return asink(function *() {
        let address = yield corebitcoin.asyncGetNewExtAddress()
        ;(address instanceof Address).should.equal(true)
      })
    })

    it('should reload wallet if revision has changed', function () {
      return asink(function *() {
        let user = yield User().asyncFromRandom()
        let corebitcoin = CoreBitcoin(db, DBBIP44Wallet(db)).fromUser(user)
        corebitcoin.dbbip44wallet = {
          asyncGet: sinon.stub().returns(Promise.resolve(corebitcoin.bip44wallet)),
          asyncRevHasChanged: () => Promise.resolve(true),
          asyncSave: sinon.stub().returns(Promise.resolve())
        }
        yield corebitcoin.asyncGetNewExtAddress()
        corebitcoin.dbbip44wallet.asyncGet.calledOnce.should.equal(true)
      }, this)
    })
  })

  describe('#asyncGetAllIntAddresses', function () {
    it('should get addresses', function () {
      return asink(function *() {
        let user = yield User().asyncFromRandom()
        let corebitcoin = CoreBitcoin().fromUser(user)
        corebitcoin.dbbip44wallet = {
          asyncRevHasChanged: () => Promise.resolve(false),
          asyncSave: () => Promise.resolve()
        }
        yield corebitcoin.asyncGetNewExtAddress()
        yield corebitcoin.asyncGetNewExtAddress()
        yield corebitcoin.asyncGetNewIntAddress()
        let addresses = yield corebitcoin.asyncGetAllIntAddresses()
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

    it('should reload wallet if revision has changed', function () {
      return asink(function *() {
        let user = yield User().asyncFromRandom()
        let corebitcoin = CoreBitcoin(db, DBBIP44Wallet(db)).fromUser(user)
        corebitcoin.dbbip44wallet = {
          asyncGet: sinon.stub().returns(Promise.resolve(corebitcoin.bip44wallet)),
          asyncRevHasChanged: () => Promise.resolve(true),
          asyncSave: sinon.stub().returns(Promise.resolve())
        }
        yield corebitcoin.asyncGetNewIntAddress()
        corebitcoin.dbbip44wallet.asyncGet.calledOnce.should.equal(true)
      }, this)
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

  describe('#asyncGetBlockchainPayerAddresses', function () {
    it('should call blockchainAPI.asyncGetBlockchainPayerAddresses', function () {
      return asink(function *() {
        let corebitcoin = CoreBitcoin()
        corebitcoin.blockchainAPI.asyncGetBlockchainPayerAddresses = sinon.spy()
        yield corebitcoin.asyncGetBlockchainPayerAddresses()
        corebitcoin.blockchainAPI.asyncGetBlockchainPayerAddresses.calledOnce.should.equal(true)
      })
    })
  })

  describe('#asyncGetAddressesBalancesSatoshis', function () {
    it('should call blockchainAPI.asyncGetAddressesBalancesSatoshis', function () {
      return asink(function *() {
        let corebitcoin = CoreBitcoin()
        corebitcoin.blockchainAPI.asyncGetAddressesBalancesSatoshis = sinon.spy()
        yield corebitcoin.asyncGetAddressesBalancesSatoshis()
        corebitcoin.blockchainAPI.asyncGetAddressesBalancesSatoshis.calledOnce.should.equal(true)
      })
    })
  })
})
