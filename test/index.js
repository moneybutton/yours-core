/* global Fullnode,before,describe,it,after */
'use strict'
let Address = Fullnode.Address
let ContentAuth = require('../lib/contentauth')
let Datt = require('../lib')
let Privkey = Fullnode.Privkey
let asink = require('asink')
let mocks = require('./mocks')
let should = require('should')
let sinon = require('sinon')

describe('Datt', function () {
  let datt

  it('should have these known properties', function () {
    should.exist(Datt.DB)
    should.exist(Datt.User)
  })

  before(function () {
    datt = Datt.create()

    // Some methods like asyncSetUserName and asyncNewContentAuth use the
    // method asyncGetLatestBlockInfo, howevever that method makes a call over
    // the internet by default. It is better to mock up that method and not
    // make that call to speed up the tests.
    datt.asyncGetLatestBlockInfo = mocks.asyncGetLatestBlockInfo
  })

  after(function () {
    return asink(function *() {
      yield datt.db.asyncDestroy()
    })
  })

  describe('#asyncInitialize', function () {
    it('should init the datt', function () {
      return asink(function *() {
        yield datt.asyncInitialize({peers: false, bitcoin: false})
        datt.isinitialized.should.equal(true)
        should.exist(datt.db)
        should.exist(datt.coreuser)
        datt.coreuser.user.keyIsSet().should.equal(true)
      })
    })
  })

  describe('@create', function () {
    it('should create a new datt', function () {
      let datt = Datt.create()
      should.exist(datt)
    })
  })

  describe('#asyncSetUserName', function () {
    it('should set the username', function () {
      return asink(function *() {
        let res = yield datt.asyncSetUserName('valid_username')
        res.should.equal(datt)
      })
    })
  })

  describe('#asyncGetUserName', function () {
    it('should get the username', function () {
      return asink(function *() {
        let userName = yield datt.asyncGetUserName()
        userName.should.equal('valid_username')
      })
    })
  })

  describe('#asyncGetUserMnemonic', function () {
    it('should return the mnemonic', function () {
      return asink(function *() {
        let mnemonic = yield datt.asyncGetUserMnemonic()
        mnemonic.should.equal(datt.coreuser.user.mnemonic)
      })
    })
  })

  describe('#asyncBuildSignAndSendTransaction', function () {
    it('should call the same method on corebitcoin', function () {
      return asink(function *() {
        let datt = Datt()
        datt.corebitcoin = {
          asyncBuildSignAndSendTransaction: sinon.stub().returns(Promise.resolve())
        }
        let toAddress = Address().fromPrivkey(Privkey().fromRandom())
        let toAmountSatoshis = 10000
        let paymentDescriptions = [{toAddress, toAmountSatoshis}]
        yield datt.asyncBuildSignAndSendTransaction(paymentDescriptions)
        datt.corebitcoin.asyncBuildSignAndSendTransaction.calledOnce.should.equal(true)
        datt.corebitcoin.asyncBuildSignAndSendTransaction.calledWith(paymentDescriptions).should.equal(true)
      }, this)
    })
  })

  describe('#monitorCoreBitcoin', function () {
    it('should call corebitcoin.on', function () {
      let datt = Datt({dbname: 'datt-temp'})
      datt.corebitcoin = {}
      datt.corebitcoin.on = sinon.spy()
      datt.monitorCoreBitcoin()
      datt.corebitcoin.on.called.should.equal(true)
    })
  })

  describe('#handleBitcoinBalance', function () {
    it('should emit bitcoin-balance', function () {
      let datt = Datt({dbname: 'datt-temp'})
      datt.emit = sinon.spy()
      datt.handleBitcoinBalance('hello')
      datt.emit.calledWith('bitcoin-balance', 'hello').should.equal(true)
    })
  })

  describe('#asyncUpdateBalance', function () {
    it('should call corebitcoin.asyncUpdateBalance', function () {
      return asink(function *() {
        let datt = Datt({dbname: 'datt-temp'})
        datt.corebitcoin = {
          asyncUpdateBalance: sinon.spy()
        }
        yield datt.asyncUpdateBalance()
        datt.corebitcoin.asyncUpdateBalance.calledOnce.should.equal(true)
      }, this)
    })
  })

  describe('#asyncGetBlockchainPayerAddresses', function () {
    it('should call corebitcoin.asyncGetBlockchainPayerAddresses', function () {
      return asink(function *() {
        let datt = Datt({dbname: 'datt-temp'})
        datt.corebitcoin = {
          asyncGetBlockchainPayerAddresses: sinon.spy()
        }
        yield datt.asyncGetBlockchainPayerAddresses()
        datt.corebitcoin.asyncGetBlockchainPayerAddresses.calledOnce.should.equal(true)
      }, this)
    })
  })

  describe('#asyncGetAddressesBalancesSatoshis', function () {
    it('should call corebitcoin.asyncGetAddressesBalancesSatoshis', function () {
      return asink(function *() {
        let datt = Datt({dbname: 'datt-temp'})
        datt.corebitcoin = {
          asyncGetAddressesBalancesSatoshis: sinon.spy()
        }
        yield datt.asyncGetAddressesBalancesSatoshis()
        datt.corebitcoin.asyncGetAddressesBalancesSatoshis.calledOnce.should.equal(true)
      }, this)
    })
  })

  describe('#asyncGetLatestBlockInfo', function () {
    it('should return info', function () {
      return asink(function *() {
        let info = yield datt.asyncGetLatestBlockInfo()
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
        let address1 = yield datt.asyncGetExtAddress(0)
        let address2 = yield datt.asyncGetExtAddress(0)
        let address3 = yield datt.asyncGetExtAddress(15)
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
        let address1 = yield datt.asyncGetNewExtAddress()
        let address2 = yield datt.asyncGetNewExtAddress()
        ;(address1 instanceof Address).should.equal(true)
        ;(address2 instanceof Address).should.equal(true)
        address1.toString().should.not.equal(address2.toString())
      })
    })
  })

  describe('#asyncGetNewIntAddress', function () {
    it('should return new addresses', function () {
      return asink(function *() {
        let address1 = yield datt.asyncGetNewIntAddress()
        let address2 = yield datt.asyncGetNewIntAddress()
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
        let contentauth = yield datt.asyncNewContentAuth(title, label, body)
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
        let contentauth = yield datt.asyncNewContentAuth(title, label, body)
        let hashbuf = yield datt.asyncPostContentAuth(contentauth)
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
        let hashbuf = yield datt.asyncPostNewContentAuth(title, label, body)
        should.exist(hashbuf)
        Buffer.isBuffer(hashbuf).should.equal(true)
        hashbuf.length.should.equal(32)
      })
    })
  })

  describe('#asyncGetRecentContentAuth', function () {
    it('should return some content', function () {
      return asink(function *() {
        let contentauths = yield datt.asyncGetRecentContentAuth()
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
        let datt = Datt()
        datt.corecontent = {
          asyncGetRecentContentAuth: () => Promise.resolve(contentauths)
        }
        datt.corebitcoin = {
          asyncGetAddressesIndividualBalancesSatoshis: () => [
            {confirmedBalanceSatoshis: 0, unconfirmedBalanceSatoshis: 0, totalBalanceSatoshis: 0},
            {confirmedBalanceSatoshis: 0, unconfirmedBalanceSatoshis: 5000, totalBalanceSatoshis: 5000}
          ]
        }
        let contentauths2 = yield datt.asyncGetHotContentAuth()
        contentauths2[0].should.equal(contentauths[1])
        contentauths2[1].should.equal(contentauths[0])
      })
    })

    it('should return some content sorted by descending total balance', function () {
      return asink(function *() {
        let contentauths = [ContentAuth(), ContentAuth()]
        let datt = Datt()
        datt.corecontent = {
          asyncGetRecentContentAuth: () => Promise.resolve(contentauths)
        }
        datt.corebitcoin = {
          asyncGetAddressesIndividualBalancesSatoshis: () => [
            {confirmedBalanceSatoshis: 5000, unconfirmedBalanceSatoshis: 0, totalBalanceSatoshis: 5000},
            {confirmedBalanceSatoshis: 5000, unconfirmedBalanceSatoshis: 5000, totalBalanceSatoshis: 10000}
          ]
        }
        let contentauths2 = yield datt.asyncGetHotContentAuth()
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
        let hashbuf = yield datt.asyncPostNewContentAuth(title, label, body)
        let contentauth = yield datt.asyncGetContentAuth(hashbuf)
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
          yield datt.asyncGetContentAuth(hashbuf)
        } catch (error) {
          errors++
          error.message.should.equal('missing')
        }
        errors.should.equal(1)
      })
    })
  })
})
