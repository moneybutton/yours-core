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
      return dattcore.init().then(function () {
        should.exist(dattcore.db)
        should.exist(dattcore.user)
        dattcore.user.keyIsSet().should.equal(true)
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
      return dattcore.setUserName('valid_username').then(function (res) {
        res.should.equal(dattcore)
      })
    })
  })

  describe('#getUserName', function () {
    it('should get the username', function () {
      return dattcore.getUserName().then(function (name) {
        name.length.should.greaterThan(0)
      })
    })
  })
})
