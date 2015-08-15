/* global it,describe,before */
var should = require('should')
var User = require('../lib/user')

describe('User', function () {
  var user

  before(function () {
    user = new User('username', 'password')
  })

  describe('User', function () {
    it('should exist test user', function () {
      should.exist(user)
    })

  })

  describe('#serialize', function () {
    it('should serialize this known user', function () {
      user.serialize().should.equal('username_19aM8TSmimwBsH9uVbS6SXigqM42fEzGtY_02af59b2cc4ebe9cc796f8076b095efaaed11f4f249805d3db18459f15be04de4f')
    })

  })

  describe('#sign', function () {
    it('should produce this known signature', function () {
      // this is possible thanks to deterministic K, a.k.a. RFC 6979
      user.sign('data').toDER().toString('hex').should.equal('3044022076b71d0d6cb383abb2c1c04fa2b9f15335bd6f2e2931bedf5d269d4a3effce9702206638742c6d07339de4a923012f6ae9cfabfaa3791926d8c8d05629fa1a0bf40d')
    })

  })

})
