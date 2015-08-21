/* global it,describe,before */
var Datt = require('../lib/datt')
var should = require('should')

describe('Datt', function () {
  var datt

  before(function () {
    datt = new Datt()
  })

  describe('Datt', function () {
    it('should see the global datt', function () {
      should.exist(datt)
    })

  })

  // TODO: Enable the rest of these tests in node by creating code with the
  // same interface that works over TCP instead of Web RTC. Or, optionally, the
  // server-side code could also use the node-webrtc library.
  if (!process.browser) {
    return
  }

  describe('#begin', function () {
    it('should initialize our global datt', function () {
      return datt.begin()
    })

  })

  describe('#signIn', function () {
    it('should sign in a user', function () {
      return datt.signIn('user', 'password').then(function (user) {
        user.username.should.equal('user')
        user.password.should.equal('password')
      })
    })

  })

  describe('#broadcastMessage', function () {
    it('should return a promise', function () {
      return datt.broadcastMessage('my message')
    })

  })

})
