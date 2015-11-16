/* global before,describe,it,after */
'use strict'
let should = require('should')
let DattCore = require('../../core')
let ContentAuth = require('../../core/content-auth')
let MsgPing = require('../../core/msg-ping')
let sinon = require('sinon')
let asink = require('asink')

describe('DattCore', function () {
  let dattcore

  it('should have these known properties', function () {
    should.exist(DattCore.CryptoWorkers)
    should.exist(DattCore.DB)
    should.exist(DattCore.User)
  })

  before(function () {
    dattcore = DattCore.create({dbname: 'datt-testdatabase'})
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
        contentauths.forEach(contentauth => {
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
