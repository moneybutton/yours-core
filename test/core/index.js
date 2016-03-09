/* global before,describe,it,after */
'use strict'
let Address = fullnode.Address
let ContentAuth = require('../../core/content-auth')
let DattCore = require('../../core')
let MsgPing = require('../../core/msg-ping')
let Privkey = fullnode.Privkey
let asink = require('asink')
let mocks = require('./mocks')
let should = require('should')
let sinon = require('sinon')

describe('DattCore', function () {
  let dattcore

  it('should have these known properties', function () {
    should.exist(DattCore.CryptoWorkers)
    should.exist(DattCore.DB)
    should.exist(DattCore.User)
  })

  before(function () {
    dattcore = DattCore.create()

    // Some methods like asyncSetUserName and asyncNewContentAuth use the
    // method asyncGetLatestBlockInfo, howevever that method makes a call over
    // the internet by default. It is better to mock up that method and not
    // make that call to speed up the tests.
    dattcore.asyncGetLatestBlockInfo = mocks.asyncGetLatestBlockInfo
  })

  after(function () {
    return asink(function *() {
      yield dattcore.db.asyncDestroy()
    })
  })

  describe('#asyncInitialize', function () {
    it('should init the dattcore', function () {
      return asink(function *() {
        yield dattcore.asyncInitialize()
        dattcore.isinitialized.should.equal(true)
        should.exist(dattcore.db)
        should.exist(dattcore.coreuser)
        dattcore.coreuser.user.keyIsSet().should.equal(true)
      })
    })
  })

  describe('@create', function () {
    it('should create a new dattcore', function () {
      let dattcore = DattCore.create()
      should.exist(dattcore)
    })
  })

  describe('#asyncSetUserName', function () {
    it('should set the username', function () {
      return asink(function *() {
        let res = yield dattcore.asyncSetUserName('valid_username')
        res.should.equal(dattcore)
      })
    })
  })

  describe('#asyncGetUserName', function () {
    it('should get the username', function () {
      return asink(function *() {
        let userName = yield dattcore.asyncGetUserName()
        userName.should.equal('valid_username')
      })
    })
  })

  describe('#asyncGetUserMnemonic', function () {
    it('should return the mnemonic', function () {
      return asink(function *() {
        let mnemonic = yield dattcore.asyncGetUserMnemonic()
        mnemonic.should.equal(dattcore.coreuser.user.mnemonic)
      })
    })
  })

  describe('#asyncBuildSignAndSendTransaction', function () {
    it('should call the same method on corebitcoin', function () {
      return asink(function *() {
        let dattcore = DattCore()
        dattcore.corebitcoin = {
          asyncBuildSignAndSendTransaction: sinon.stub().returns(Promise.resolve())
        }
        let toAddress = Address().fromPrivkey(Privkey().fromRandom())
        let toAmountSatoshis = 10000
        yield dattcore.asyncBuildSignAndSendTransaction(toAddress, toAmountSatoshis)
        dattcore.corebitcoin.asyncBuildSignAndSendTransaction.calledOnce.should.equal(true)
        dattcore.corebitcoin.asyncBuildSignAndSendTransaction.calledWith(toAddress, toAmountSatoshis).should.equal(true)
      }, this)
    })
  })

  describe('#monitorCoreBitcoin', function () {
    it('should call corebitcoin.on', function () {
      let dattcore = DattCore({dbname: 'datt-temp'})
      dattcore.corebitcoin = {}
      dattcore.corebitcoin.on = sinon.spy()
      dattcore.monitorCoreBitcoin()
      dattcore.corebitcoin.on.called.should.equal(true)
    })
  })

  describe('#handleBitcoinBalance', function () {
    it('should emit bitcoin-balance', function () {
      let dattcore = DattCore({dbname: 'datt-temp'})
      dattcore.emit = sinon.spy()
      dattcore.handleBitcoinBalance('hello')
      dattcore.emit.calledWith('bitcoin-balance', 'hello').should.equal(true)
    })
  })

  describe('#asyncUpdateBalance', function () {
    it('should call corebitcoin.asyncUpdateBalance', function () {
      return asink(function *() {
        let dattcore = DattCore({dbname: 'datt-temp'})
        dattcore.corebitcoin = {
          asyncUpdateBalance: sinon.spy()
        }
        yield dattcore.asyncUpdateBalance()
        dattcore.corebitcoin.asyncUpdateBalance.calledOnce.should.equal(true)
      }, this)
    })
  })

  describe('#asyncGetLatestBlockInfo', function () {
    it('should return info', function () {
      return asink(function *() {
        let info = yield dattcore.asyncGetLatestBlockInfo()
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
        let address1 = yield dattcore.asyncGetExtAddress(0)
        let address2 = yield dattcore.asyncGetExtAddress(0)
        let address3 = yield dattcore.asyncGetExtAddress(15)
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
        let address1 = yield dattcore.asyncGetNewExtAddress()
        let address2 = yield dattcore.asyncGetNewExtAddress()
        ;(address1 instanceof Address).should.equal(true)
        ;(address2 instanceof Address).should.equal(true)
        address1.toString().should.not.equal(address2.toString())
      })
    })
  })

  describe('#asyncGetNewIntAddress', function () {
    it('should return new addresses', function () {
      return asink(function *() {
        let address1 = yield dattcore.asyncGetNewIntAddress()
        let address2 = yield dattcore.asyncGetNewIntAddress()
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
        let contentauth = yield dattcore.asyncNewContentAuth(title, label, body)
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
        let contentauth = yield dattcore.asyncNewContentAuth(title, label, body)
        let hashbuf = yield dattcore.asyncPostContentAuth(contentauth)
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
        let hashbuf = yield dattcore.asyncPostNewContentAuth(title, label, body)
        should.exist(hashbuf)
        Buffer.isBuffer(hashbuf).should.equal(true)
        hashbuf.length.should.equal(32)
      })
    })
  })

  describe('#asyncGetRecentContentAuth', function () {
    it('should return some content', function () {
      return asink(function *() {
        let contentauths = yield dattcore.asyncGetRecentContentAuth()
        contentauths.length.should.greaterThan(0)
        contentauths.forEach((contentauth) => {
          ;(contentauth instanceof ContentAuth).should.equal(true)
          should.exist(contentauth.cachehash)
        })
      })
    })
  })

  describe('#monitorCorePeers', function () {
    it('should call corepeers.on', function () {
      let dattcore = DattCore({dbname: 'datt-temp'})
      dattcore.corepeers = {}
      dattcore.corepeers.on = sinon.spy()
      dattcore.monitorCorePeers()
      dattcore.corepeers.on.called.should.equal(true)
    })
  })

  describe('#handlePeersConnection', function () {
    it('should emit peers-connection', function () {
      let dattcore = DattCore({dbname: 'datt-temp'})
      dattcore.emit = sinon.spy()
      dattcore.handlePeersConnection('hello')
      dattcore.emit.calledWith('peers-connection', 'hello').should.equal(true)
    })
  })

  describe('#asyncHandlePeersContentAuth', function () {
    it('should emit peers-content-auth', function () {
      let dattcore = DattCore({dbname: 'datt-temp'})
      dattcore.emit = sinon.spy()
      dattcore.handlePeersContentAuth('hello')
      dattcore.emit.calledWith('peers-content-auth', 'hello').should.equal(true)
    })
  })

  describe('#asyncNumActiveConnections', function () {
    it('should call corepeers numActiveConnections', function () {
      return asink(function *() {
        let dattcore = DattCore({dbname: 'datt-temp'})
        dattcore.corepeers = {}
        dattcore.corepeers.numActiveConnections = sinon.spy()
        yield dattcore.asyncNumActiveConnections()
        dattcore.corepeers.numActiveConnections.calledOnce.should.equal(true)
      })
    })
  })

  describe('#broadcastMsg', function () {
    it('should call corepeers.broadcastMsg', function () {
      let dattcore = DattCore({dbname: 'datt-temp'})
      dattcore.corepeers = {}
      dattcore.corepeers.broadcastMsg = sinon.spy()
      let msg = MsgPing().fromRandom()
      dattcore.broadcastMsg(msg)
      dattcore.corepeers.broadcastMsg.calledWith(msg).should.equal(true)
    })
  })
})
