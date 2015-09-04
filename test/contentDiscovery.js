/* global it,describe,before */
var ContentDiscovery = require('../lib/contentDiscovery')
var Message = require('../lib/message')
var should = require('should')

var q = require('q')

// Create a temporary to be used during tests
function getMainObject () {
  var main = {}
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

describe('ContentDiscovery', function () {
  var contentDiscovery
  var main = getMainObject()

  before(function () {
    contentDiscovery = new ContentDiscovery()
  })

  describe('ContentDiscovery', function () {
    it('should exist test contentDiscovery', function () {
      should.exist(contentDiscovery)
    })
  })

  describe('#handleContentDiscoveryRequest', function () {
    it('should not handle message coming from itself', function () {
      var message = Message.requestPeersForHash('testhash', main.peer.id)
      return contentDiscovery.handleContentDiscoveryRequest(message, main).then(function (result) {
        result.should.equal('Own message')
      })
    })

    it('should handle message with another id and send an announcement because it has this content', function () {
      main.peer.id = '1'
      var message = Message.requestPeersForHash('testhash', main.peer.id)
      main.peer.id = '0'
      return contentDiscovery.handleContentDiscoveryRequest(message, main).then(function (result) {
        result.should.eql(['broadcasted', 'sentMessage'])
      })
    })

    it('should not propagate the same message twice', function () {
      main.peer.id = '1'
      var message = Message.requestPeersForHash('testhash', main)
      main.peer.id = '0'
      return contentDiscovery.handleContentDiscoveryRequest(message, main).then(function (result) {
        result.should.equal('Already seen message. Stop propagating')
      })
    })

    it('should propagate message and not send announcement', function () {
      main.peer.id = '1'
      var message = Message.requestPeersForHash('testhash2', main)
      main.peer.id = '0'
      return contentDiscovery.handleContentDiscoveryRequest(message, main).then(function (result) {
        result.should.eql(['broadcasted', 'Did not have content'])
      })
    })
  })

  it('should throw an error if it cannot send announcement', function () {
    // Create main object with failing send
    var main2 = getMainObject()
    main2.sendMessage = function (msg, sender) {
      var deferred = q.defer()
      deferred.reject('send error')
      return deferred.promise
    }
    main2.peer.id = '2'
    var message = Message.requestPeersForHash('testhash', main2)
    main2.peer.id = '0'

    return contentDiscovery.handleContentDiscoveryRequest(message, main2).then(function (result) {
      should.fail('ContentDiscover#handleContentDiscoveryRequest should fail when unable to send message')
    }).fail(function (error) {
      error.should.equal('send error')
    })
  })
})
