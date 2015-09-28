/* global before,describe,it,after */
'use strict'
let should = require('should')
let DattCore = require('../lib')

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
})
