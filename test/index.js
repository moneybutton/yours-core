/* global before,describe,it,after */
'use strict'
let should = require('should')
let DattNode = require('../lib')

describe('DattNode', function () {
  let dattnode

  it('should have these known properties', function () {
    should.exist(DattNode.AsyncCrypto)
    should.exist(DattNode.DB)
    should.exist(DattNode.User)
  })

  before(function () {
    dattnode = DattNode()
  })

  after(function () {
    return dattnode.close()
  })

  describe('#init', function () {
    it('should init the dattnode', function () {
      return dattnode.init().then(function () {
        should.exist(dattnode.db)
        should.exist(dattnode.user)
        dattnode.user.keyIsSet().should.equal(true)
      })
    })
  })

  describe('@create', function () {
    it('should create a new dattnode', function () {
      let dattnode = DattNode.create()
      should.exist(dattnode)
    })
  })
})
