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

  describe('#init', function () {
    it('should compute the user private key and public key', function () {
      return user.init().then(function () {
        should.exist(user.privateKey)
        should.exist(user.publicKey)
        should.exist(user.address)
      })
    })
  })

  describe('#then', function () {
    it('should take a callback function and invoke that function when user is initialized', function () {
      var otheruser = new User('ausername', 'apassword')
      otheruser.init()
      return otheruser.then(function () {
        should.exist(otheruser.privateKey)
        should.exist(otheruser.publicKey)
        should.exist(otheruser.address)
      })
    })

    it('should bind the instance as "this" within the callback function', function () {
      var otheruser = new User('ausername', 'apassword')
      otheruser.init()
      return otheruser.then(function () {
        should.exist(this)
        otheruser.username.should.eql(this.username)
        otheruser.publicKey.should.eql(this.publicKey)
      })
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
      return user.sign('data').then(function (sig) {
        sig.toDER().toString('hex').should.equal('3044022076b71d0d6cb383abb2c1c04fa2b9f15335bd6f2e2931bedf5d269d4a3effce9702206638742c6d07339de4a923012f6ae9cfabfaa3791926d8c8d05629fa1a0bf40d')
      })
    })

  })

})
