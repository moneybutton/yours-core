/* global describe,it,before,after */
'use strict'
let DB = require('../../core/db')
let CoreUser = require('../../core/core-user')
let should = require('should')
let MsgAuth = require('../../core/msg-auth')
let BR = require('fullnode/lib/br')

describe('CoreUser', function () {
  let db = DB('datt-testdatabase')
  let coreuser = CoreUser(db)
  let blockidhex = '00000000000000000e6188a4cc93e3d3244b20bfdef1e9bd9db932e30f3aa2f1'
  let blockhashbuf = BR(new Buffer(blockidhex, 'hex')).readReverse()
  let blockheightnum = 376949

  before(function () {
    return db.asyncInitialize()
  })

  after(function () {
    return db.asyncDestroy()
  })

  it('should exist', function () {
    should.exist(CoreUser)
    should.exist(CoreUser())
  })

  describe('#asyncInitialize', function () {
    it('should initialize a new user', function () {
      return coreuser.asyncInitialize().then(coreuser => {
        coreuser.user.name.should.equal('satoshi')
        coreuser.dbuser.user.name.should.equal('satoshi')
        should.exist(coreuser.user.mnemonic)
        should.exist(coreuser.user.masterxprv)
        should.exist(coreuser.user.masterxpub)
      })
    })
  })

  describe('#asyncSetName', function () {
    it('should set the name to a new name', function () {
      let name = 'newname'
      return coreuser.asyncSetName(name).then(coreuser => {
        coreuser.user.name.should.equal(name)
        coreuser.dbuser.user.name.should.equal(name)
      })
    })
  })

  describe('#asyncGetMsgAuth', function () {
    it('should return a valid msgauth', function () {
      return coreuser.asyncGetMsgAuth(blockhashbuf, blockheightnum).then(msgauth => {
        ;(msgauth instanceof MsgAuth).should.equal(true)
        return msgauth.asyncVerify()
      }).then(verified => {
        verified.should.equal(true)
      })
    })
  })
})
