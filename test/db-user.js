/* global describe,it,before,after */
'use strict'
let DB = require('../lib/db')
let DBUser = require('../lib/db-user')
let User = require('../lib/user')
let asink = require('asink')
let should = require('should')

describe('DBUser', function () {
  let db = DB('datt-testdatabase')
  let user

  before(function () {
    return asink(function *() {
      yield db.asyncInitialize()
      user = yield User().asyncFromRandom()
    })
  })

  after(function () {
    return db.asyncDestroy()
  })

  it('should exist', function () {
    should.exist(DBUser)
    should.exist(DBUser())
    should.exist(DBUser(db, user))
  })

  describe('#asyncSave', function () {
    it('should save a dbuser', function () {
      return asink(function *() {
        let dbuser = DBUser(db, user)
        yield dbuser.asyncSave()
        dbuser.user.mnemonic.should.equal(user.mnemonic)
      })
    })
  })

  describe('#asyncGet', function () {
    it('should get a dbuser', function () {
      return asink(function *() {
        let dbuser = DBUser(db, user)
        yield dbuser.asyncSave()
        dbuser.user.mnemonic.should.equal(user.mnemonic)
        let user2 = yield DBUser(db).asyncGet()
        should.exist(user2)
        user2.mnemonic.should.equal(dbuser.user.mnemonic)
      })
    })
  })
})
