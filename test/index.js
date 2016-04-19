/* global Fullnode,before,describe,it,after */
'use strict'
let Address = Fullnode.Address
let ContentAuth = require('../lib/contentauth')
let YoursCore = require('../lib')
let Privkey = Fullnode.Privkey
let asink = require('asink')
let mocks = require('./mocks')
let should = require('should')
let sinon = require('sinon')

describe('YoursCore', function () {
  let yourscore

  it('should have these known properties', function () {
    should.exist(YoursCore.DB)
    should.exist(YoursCore.User)
  })

  before(function () {
    yourscore = YoursCore.create()

    // Some methods like asyncSetUserName and asyncNewContentAuth use the
    // method asyncGetLatestBlockInfo, howevever that method makes a call over
    // the internet by default. It is better to mock up that method and not
    // make that call to speed up the tests.
    yourscore.asyncGetLatestBlockInfo = mocks.asyncGetLatestBlockInfo
  })

  after(function () {
    return asink(function *() {
      yield yourscore.db.asyncDestroy()
    })
  })

  describe('#asyncInitialize', function () {
    it('should init the yourscore', function () {
      return asink(function *() {
        yield yourscore.asyncInitialize({peers: false, bitcoin: false})
        yourscore.isinitialized.should.equal(true)
        should.exist(yourscore.db)
        should.exist(yourscore.coreuser)
        yourscore.coreuser.user.keyIsSet().should.equal(true)
      })
    })
  })

  describe('@create', function () {
    it('should create a new yourscore', function () {
      let yourscore = YoursCore.create()
      should.exist(yourscore)
    })
  })

  describe('#asyncSetUserName', function () {
    it('should set the username', function () {
      return asink(function *() {
        let res = yield yourscore.asyncSetUserName('valid_username')
        res.should.equal(yourscore)
      })
    })
  })

  describe('#asyncGetUserName', function () {
    it('should get the username', function () {
      return asink(function *() {
        let userName = yield yourscore.asyncGetUserName()
        userName.should.equal('valid_username')
      })
    })
  })

  describe('#asyncGetUserMnemonic', function () {
    it('should return the mnemonic', function () {
      return asink(function *() {
        let mnemonic = yield yourscore.asyncGetUserMnemonic()
        mnemonic.should.equal(yourscore.coreuser.user.mnemonic)
      })
    })
  })

  describe('#asyncBuildSignAndSendTransaction', function () {
    it('should call the same method on corebitcoin', function () {
      return asink(function *() {
        let yourscore = YoursCore()
        yourscore.corebitcoin = {
          asyncBuildSignAndSendTransaction: sinon.stub().returns(Promise.resolve())
        }
        let toAddress = Address().fromPrivkey(Privkey().fromRandom())
        let toAmountSatoshis = 10000
        let paymentDescriptions = [{toAddress, toAmountSatoshis}]
        yield yourscore.asyncBuildSignAndSendTransaction(paymentDescriptions)
        yourscore.corebitcoin.asyncBuildSignAndSendTransaction.calledOnce.should.equal(true)
        yourscore.corebitcoin.asyncBuildSignAndSendTransaction.calledWith(paymentDescriptions).should.equal(true)
      }, this)
    })
  })

  describe('#monitorCoreBitcoin', function () {
    it('should call corebitcoin.on', function () {
      let yourscore = YoursCore({dbname: 'yourscore-temp'})
      yourscore.corebitcoin = {}
      yourscore.corebitcoin.on = sinon.spy()
      yourscore.monitorCoreBitcoin()
      yourscore.corebitcoin.on.called.should.equal(true)
    })
  })

  describe('#handleBitcoinBalance', function () {
    it('should emit bitcoin-balance', function () {
      let yourscore = YoursCore({dbname: 'yourscore-temp'})
      yourscore.emit = sinon.spy()
      yourscore.handleBitcoinBalance('hello')
      yourscore.emit.calledWith('bitcoin-balance', 'hello').should.equal(true)
    })
  })

  describe('#asyncUpdateBalance', function () {
    it('should call corebitcoin.asyncUpdateBalance', function () {
      return asink(function *() {
        let yourscore = YoursCore({dbname: 'yourscore-temp'})
        yourscore.corebitcoin = {
          asyncUpdateBalance: sinon.spy()
        }
        yield yourscore.asyncUpdateBalance()
        yourscore.corebitcoin.asyncUpdateBalance.calledOnce.should.equal(true)
      }, this)
    })
  })

  describe('#asyncGetBlockchainPayerAddresses', function () {
    it('should call corebitcoin.asyncGetBlockchainPayerAddresses', function () {
      return asink(function *() {
        let yourscore = YoursCore({dbname: 'yourscore-temp'})
        yourscore.corebitcoin = {
          asyncGetBlockchainPayerAddresses: sinon.spy()
        }
        yield yourscore.asyncGetBlockchainPayerAddresses()
        yourscore.corebitcoin.asyncGetBlockchainPayerAddresses.calledOnce.should.equal(true)
      }, this)
    })
  })

  describe('#asyncGetAddressesBalancesSatoshis', function () {
    it('should call corebitcoin.asyncGetAddressesBalancesSatoshis', function () {
      return asink(function *() {
        let yourscore = YoursCore({dbname: 'yourscore-temp'})
        yourscore.corebitcoin = {
          asyncGetAddressesBalancesSatoshis: sinon.spy()
        }
        yield yourscore.asyncGetAddressesBalancesSatoshis()
        yourscore.corebitcoin.asyncGetAddressesBalancesSatoshis.calledOnce.should.equal(true)
      }, this)
    })
  })

  describe('#asyncGetLatestBlockInfo', function () {
    it('should return info', function () {
      return asink(function *() {
        let info = yield yourscore.asyncGetLatestBlockInfo()
        should.exist(info.idbuf)
        should.exist(info.idhex)
        should.exist(info.hashbuf)
        should.exist(info.hashhex)
        should.exist(info.height)
      })
    })
  })

  describe('#asyncGetExtAddress', function () {
    it('should return addresses', function () {
      return asink(function *() {
        let address1 = yield yourscore.asyncGetExtAddress(0)
        let address2 = yield yourscore.asyncGetExtAddress(0)
        let address3 = yield yourscore.asyncGetExtAddress(15)
        ;(address1 instanceof Address).should.equal(true)
        ;(address2 instanceof Address).should.equal(true)
        address1.toString().should.equal(address2.toString())
        address1.toString().should.not.equal(address3.toString())
      })
    })
  })

  describe('#asyncGetNewExtAddress', function () {
    it('should return new addresses', function () {
      return asink(function *() {
        let address1 = yield yourscore.asyncGetNewExtAddress()
        let address2 = yield yourscore.asyncGetNewExtAddress()
        ;(address1 instanceof Address).should.equal(true)
        ;(address2 instanceof Address).should.equal(true)
        address1.toString().should.not.equal(address2.toString())
      })
    })
  })

  describe('#asyncGetNewIntAddress', function () {
    it('should return new addresses', function () {
      return asink(function *() {
        let address1 = yield yourscore.asyncGetNewIntAddress()
        let address2 = yield yourscore.asyncGetNewIntAddress()
        ;(address1 instanceof Address).should.equal(true)
        ;(address2 instanceof Address).should.equal(true)
        address1.toString().should.not.equal(address2.toString())
      })
    })
  })

  describe('#asyncNewContentAuth', function () {
    it('should create a new ContentAuth', function () {
      return asink(function *() {
        let title = 'test title'
        let label = 'testlabel'
        let body = 'test body'
        let contentauth = yield yourscore.asyncNewContentAuth(title, label, body)
        ;(contentauth instanceof ContentAuth).should.equal(true)
        let content = contentauth.getContent()
        content.title.should.equal('test title')
        content.label.should.equal('testlabel')
        content.body.should.equal('test body')
      })
    })
  })

  describe('#asyncPostContentAuth', function () {
    it('should create a new ContentAuth and then post it', function () {
      return asink(function *() {
        let title = 'test title'
        let label = 'testlabel'
        let body = 'test body'
        let contentauth = yield yourscore.asyncNewContentAuth(title, label, body)
        let hashbuf = yield yourscore.asyncPostContentAuth(contentauth)
        should.exist(hashbuf)
        Buffer.isBuffer(hashbuf).should.equal(true)
        hashbuf.length.should.equal(32)
      })
    })
  })

  describe('#asyncPostNewContentAuth', function () {
    it('should post new content', function () {
      return asink(function *() {
        let title = 'test title'
        let label = 'testlabel'
        let body = 'test body'
        let hashbuf = yield yourscore.asyncPostNewContentAuth(title, label, body)
        should.exist(hashbuf)
        Buffer.isBuffer(hashbuf).should.equal(true)
        hashbuf.length.should.equal(32)
      })
    })
  })

  describe('#asyncGetRecentContentAuth', function () {
    it('should return some content', function () {
      return asink(function *() {
        let contentauths = yield yourscore.asyncGetRecentContentAuth()
        contentauths.length.should.greaterThan(0)
        contentauths.forEach((contentauth) => {
          ;(contentauth instanceof ContentAuth).should.equal(true)
          should.exist(contentauth.cachehash)
        })
      })
    })
  })

  describe('#asyncGetHotContentAuth', function () {
    it('should return some content sorted by descending total balance', function () {
      return asink(function *() {
        let contentauths = [ContentAuth(), ContentAuth()]
        let yourscore = YoursCore()
        yourscore.corecontent = {
          asyncGetRecentContentAuth: () => Promise.resolve(contentauths)
        }
        yourscore.corebitcoin = {
          asyncGetAddressesIndividualBalancesSatoshis: () => [
            {confirmedBalanceSatoshis: 0, unconfirmedBalanceSatoshis: 0, totalBalanceSatoshis: 0},
            {confirmedBalanceSatoshis: 0, unconfirmedBalanceSatoshis: 5000, totalBalanceSatoshis: 5000}
          ]
        }
        let contentauths2 = yield yourscore.asyncGetHotContentAuth()
        contentauths2[0].should.equal(contentauths[1])
        contentauths2[1].should.equal(contentauths[0])
      })
    })

    it('should return some content sorted by descending total balance', function () {
      return asink(function *() {
        let contentauths = [ContentAuth(), ContentAuth()]
        let yourscore = YoursCore()
        yourscore.corecontent = {
          asyncGetRecentContentAuth: () => Promise.resolve(contentauths)
        }
        yourscore.corebitcoin = {
          asyncGetAddressesIndividualBalancesSatoshis: () => [
            {confirmedBalanceSatoshis: 5000, unconfirmedBalanceSatoshis: 0, totalBalanceSatoshis: 5000},
            {confirmedBalanceSatoshis: 5000, unconfirmedBalanceSatoshis: 5000, totalBalanceSatoshis: 10000}
          ]
        }
        let contentauths2 = yield yourscore.asyncGetHotContentAuth()
        contentauths2[0].should.equal(contentauths[1])
        contentauths2[1].should.equal(contentauths[0])
      })
    })
  })

  describe('#asyncGetContentAuth', function () {
    it('should return a known piece of content', function () {
      return asink(function *() {
        let title = 'test title 2'
        let label = 'testlabel'
        let body = 'test body'
        let hashbuf = yield yourscore.asyncPostNewContentAuth(title, label, body)
        let contentauth = yield yourscore.asyncGetContentAuth(hashbuf)
        let hashbuf2 = yield contentauth.asyncGetHash()
        Buffer.compare(hashbuf2, hashbuf).should.equal(0)
      })
    })

    it('should not return a fake piece of content', function () {
      return asink(function *() {
        let hashbuf = new Buffer(32)
        hashbuf.fill(0)
        let errors = 0
        try {
          yield yourscore.asyncGetContentAuth(hashbuf)
        } catch (error) {
          errors++
          error.message.should.equal('missing')
        }
        errors.should.equal(1)
      })
    })
  })
})
