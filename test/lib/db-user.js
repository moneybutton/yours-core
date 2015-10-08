/* global describe,it,before,after */
'use strict'
let DB = require('../../lib/db')
let DBUser = require('../../lib/db-user')
let User = require('../../lib/user')
let should = require('should')

describe('DBUser', function () {
  let db = DB('datt-testdatabase')
  let user

  before(function () {
    return db.asyncInitialize().then(() => {
      return User().asyncFromRandom()
    }).then(_user => {
      user = _user
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
      let dbuser = DBUser(db, user)
      return dbuser.asyncSave().then(() => {
        dbuser.user.mnemonic.should.equal(user.mnemonic)
      })
    })
  })

  describe('#asyncGet', function () {
    it('should get a dbuser', function () {
      let dbuser = DBUser(db, user)
      return dbuser.asyncSave().then(() => {
        dbuser.user.mnemonic.should.equal(user.mnemonic)
        return DBUser(db).asyncGet()
      }).then(user => {
        should.exist(user)
        user.mnemonic.should.equal(dbuser.user.mnemonic)
      })
    })
  })
})
