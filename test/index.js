/* global describe,it */
'use strict'
let should = require('should')
let DattNode = require('../lib')

describe('DattNode', function () {
  it('should have these known properties', function () {
    should.exist(DattNode.AsyncCrypto)
    should.exist(DattNode.DB)
    should.exist(DattNode.User)
  })
})
