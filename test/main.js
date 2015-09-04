/* global it,describe,before */
var Main = require('../lib/main')
var should = require('should')

describe('Main', function () {
  var main

  before(function () {
    main = new Main()
  })

  describe('Main', function () {
    it('should see the global main', function () {
      should.exist(main)
    })

  })

  // TODO: Enable the rest of these tests in node by creating code with the
  // same interface that works over TCP instead of Web RTC. Or, optionally, the
  // server-side code could also use the node-webrtc library.
  if (!process.browser) {
    return
  }

  /* TODO: re-enable when tests automatically run web RTC rendezvous server
  describe('#init', function () {
    it('should initialize our global main', function () {
      return main.init()
    })

  })
  */

  describe('#signIn', function () {
    it('should sign in a user', function () {
      return main.signIn('user', 'password').then(function (user) {
        should.exist(main.user)
        main.user.username.should.equal('user')
        main.user.password.should.equal('password')
      })
    })

  })

  describe('#broadcastMessage', function () {
    it('should return a promise', function () {
      return main.broadcastMessage('my message')
    })

  })

})
