/* global before,describe,it,after */
'use strict'
let should = require('should')
let DattCore = require('../../lib')

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

  describe('#setUserName', function () {
    it('should set the username', function () {
      return dattcore.setUserName('valid_username').then(res => {
        res.should.equal(dattcore)
      })
    })
  })

  describe('#getUserName', function () {
    it('should get the username', function () {
      return dattcore.getUserName().then(userName => {
        userName.should.equal('valid_username')
      })
    })
  })

  describe('#getUserMnemonic', function () {
    it('should return the mnemonic', function () {
      return dattcore.getUserMnemonic().then(mnemonic => {
        mnemonic.should.equal(dattcore.coreuser.user.mnemonic)
      })
    })
  })

  describe('#getLatestBlockInfo', function () {
    it('should return info', function () {
      return dattcore.getLatestBlockInfo().then(info => {
        should.exist(info.idbuf)
        should.exist(info.idhex)
        should.exist(info.hashbuf)
        should.exist(info.hashhex)
        should.exist(info.height)
      })
    })
  })
})
