/* global it,describe,before */
var Main = require('../lib/main')
var Message = require('../lib/message')
var q = require('q')
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

  describe('#handleContentDiscoveryRequest', function () {
    function getMainObject () {
      var main = new Main()
      main.getContent = function (hash) {
        var deferred = q.defer()
        if (hash === 'testhash') {
          deferred.resolve('testcontent')
        } else {
          deferred.reject()
        }
        return deferred.promise
      }
      main.broadcastMessage = function (msg) {
        return q('broadcasted')
      }
      main.sendMessage = function (msg, sender) {
        return q('sentMessage')
      }

      main.peer = {}
      main.peer.id = '0'
      return main
    }

    var mainMock = getMainObject()

    it('should not handle message coming from itself', function () {
      var message = Message.requestPeersForHash('testhash', mainMock.peer.id)
      return mainMock.handleContentDiscoveryRequest(message).then(function (result) {
        result.should.equal('Own message')
      })
    })

    it('should handle message with another id and send an announcement because it has this content', function () {
      mainMock.peer.id = '1'
      var message = Message.requestPeersForHash('testhash', mainMock.peer.id)
      mainMock.peer.id = '0'
      return mainMock.handleContentDiscoveryRequest(message).then(function (result) {
        result.should.eql(['broadcasted', 'sentMessage'])
      })
    })

    it('should not propagate the same message twice', function () {
      mainMock.peer.id = '1'
      var message = Message.requestPeersForHash('testhash', mainMock.peer.id)
      mainMock.peer.id = '0'
      return mainMock.handleContentDiscoveryRequest(message).then(function (result) {
        result.should.equal('Already seen message. Stop propagating')
      })
    })

    it('should propagate message and not send announcement', function () {
      mainMock.peer.id = '1'
      var message = Message.requestPeersForHash('testhash2', mainMock.peer.id)
      mainMock.peer.id = '0'
      return mainMock.handleContentDiscoveryRequest(message).then(function (result) {
        result.should.eql(['broadcasted', 'Did not have content'])
      })
    })

    it('should throw an error if it cannot send announcement', function () {
      // Create mainMock object with failing send
      var mainMock2 = getMainObject()
      mainMock2.sendMessage = function (msg, sender) {
        var deferred = q.defer()
        deferred.reject('send error')
        return deferred.promise
      }
      mainMock2.peer.id = '2'
      var message = Message.requestPeersForHash('testhash', mainMock2.peer.id)
      mainMock2.peer.id = '0'

      return mainMock2.handleContentDiscoveryRequest(message).then(function (result) {
        should.fail('ContentDiscover#handleContentDiscoveryRequest should fail when unable to send message')
      }).fail(function (error) {
        error.should.equal('send error')
      })
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
