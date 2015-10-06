/* global before,describe,it,after */
'use strict'
let should = require('should')
let DattCore = require('../../lib')
let ContentAuth = require('../../lib/content-auth')

describe('DattCore', function () {
  let dattcore

  it('should have these known properties', function () {
    should.exist(DattCore.AsyncCrypto)
    should.exist(DattCore.DB)
    should.exist(DattCore.User)
  })

  before(function () {
    dattcore = DattCore()
  })

  after(function () {
    return dattcore.close()
  })

  describe('#init', function () {
    it('should init the dattcore', function () {
      return dattcore.init().then(() => {
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
      return dattcore.asyncSetUserName('valid_username').then(res => {
        res.should.equal(dattcore)
      })
    })
  })

  describe('#asyncGetUserName', function () {
    it('should get the username', function () {
      return dattcore.asyncGetUserName().then(userName => {
        userName.should.equal('valid_username')
      })
    })
  })

  describe('#asyncGetUserMnemonic', function () {
    it('should return the mnemonic', function () {
      return dattcore.asyncGetUserMnemonic().then(mnemonic => {
        mnemonic.should.equal(dattcore.coreuser.user.mnemonic)
      })
    })
  })

  describe('#asyncGetLatestBlockInfo', function () {
    it('should return info', function () {
      return dattcore.asyncGetLatestBlockInfo().then(info => {
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
      let title = 'test title'
      let label = 'testlabel'
      let body = 'test body'
      return dattcore.asyncNewContentAuth(title, label, body).then(contentauth => {
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
      let title = 'test title'
      let label = 'testlabel'
      let body = 'test body'
      return dattcore.asyncNewContentAuth(title, label, body).then(contentauth => {
        return dattcore.asyncPostContentAuth(contentauth)
      }).then(hashbuf => {
        should.exist(hashbuf)
        Buffer.isBuffer(hashbuf).should.equal(true)
        hashbuf.length.should.equal(32)
      })
    })
  })

  describe('#asyncPostNewContentAuth', function () {
    it('should post new content', function () {
      let title = 'test title'
      let label = 'testlabel'
      let body = 'test body'
      return dattcore.asyncPostNewContentAuth(title, label, body).then(hashbuf => {
        should.exist(hashbuf)
        Buffer.isBuffer(hashbuf).should.equal(true)
        hashbuf.length.should.equal(32)
      })
    })
  })
})
