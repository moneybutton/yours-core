/* global fullnode,describe,it,before,after */
'use strict'
let BR = fullnode.BR
let CoreUser = require('../lib/core-user')
let DB = require('../lib/db')
let MsgAuth = require('../lib/msg-auth')
let asink = require('asink')
let should = require('should')

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
      return asink(function *() {
        yield coreuser.asyncInitialize()
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
      return asink(function *() {
        let name = 'newname'
        yield coreuser.asyncSetName(name)
        coreuser.user.name.should.equal(name)
        coreuser.dbuser.user.name.should.equal(name)
      })
    })
  })

  describe('#asyncGetMsgAuth', function () {
    it('should return a valid msgauth', function () {
      return asink(function *() {
        let msgauth = yield coreuser.asyncGetMsgAuth(blockhashbuf, blockheightnum)
        ;(msgauth instanceof MsgAuth).should.equal(true)
        let verified = yield msgauth.asyncVerify()
        verified.should.equal(true)
      })
    })
  })
})
