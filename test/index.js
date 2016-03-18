/* global fullnode,before,describe,it,after */
'use strict'
let Address = fullnode.Address
let ContentAuth = require('../lib/content-auth')
let Datt = require('../lib')
let MsgPing = require('../lib/msg-ping')
let Privkey = fullnode.Privkey
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
        yield datt.asyncInitialize()
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
        yield datt.asyncBuildSignAndSendTransaction(toAddress, toAmountSatoshis)
        datt.corebitcoin.asyncBuildSignAndSendTransaction.calledOnce.should.equal(true)
        datt.corebitcoin.asyncBuildSignAndSendTransaction.calledWith(toAddress, toAmountSatoshis).should.equal(true)
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

  describe('#monitorCorePeers', function () {
    it('should call corepeers.on', function () {
      let datt = Datt({dbname: 'datt-temp'})
      datt.corepeers = {}
      datt.corepeers.on = sinon.spy()
      datt.monitorCorePeers()
      datt.corepeers.on.called.should.equal(true)
    })
  })

  describe('#handlePeersConnection', function () {
    it('should emit peers-connection', function () {
      let datt = Datt({dbname: 'datt-temp'})
      datt.emit = sinon.spy()
      datt.handlePeersConnection('hello')
      datt.emit.calledWith('peers-connection', 'hello').should.equal(true)
    })
  })

  describe('#asyncHandlePeersContentAuth', function () {
    it('should emit peers-content-auth', function () {
      let datt = Datt({dbname: 'datt-temp'})
      datt.emit = sinon.spy()
      datt.handlePeersContentAuth('hello')
      datt.emit.calledWith('peers-content-auth', 'hello').should.equal(true)
    })
  })

  describe('#asyncNumActiveConnections', function () {
    it('should call corepeers numActiveConnections', function () {
      return asink(function *() {
        let datt = Datt({dbname: 'datt-temp'})
        datt.corepeers = {}
        datt.corepeers.numActiveConnections = sinon.spy()
        yield datt.asyncNumActiveConnections()
        datt.corepeers.numActiveConnections.calledOnce.should.equal(true)
      })
    })
  })

  describe('#broadcastMsg', function () {
    it('should call corepeers.broadcastMsg', function () {
      let datt = Datt({dbname: 'datt-temp'})
      datt.corepeers = {}
      datt.corepeers.broadcastMsg = sinon.spy()
      let msg = MsgPing().fromRandom()
      datt.broadcastMsg(msg)
      datt.corepeers.broadcastMsg.calledWith(msg).should.equal(true)
    })
  })
})
