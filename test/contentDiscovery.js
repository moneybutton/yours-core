/* global it,describe,before */
var ContentDiscovery = require('../lib/contentDiscovery')
var Message = require('../lib/message')
var should = require('should')
var q = require('q')

// Create a temporary to be used during tests
function getDattObject() {
  var datt = {}
  datt.getContent = function(hash) {
    var deferred = q.defer()
    if (hash === "testhash") {
      deferred.resolve("testcontent")
    } else {
      deferred.reject()
    }
    return deferred.promise
  }
  datt.broadcastMessage = function(msg) {
    return q("broadcasted")
  }
  datt.sendMessage = function(msg, sender) {
    return q("sentMessage")
  }

  datt.peer = {}
  datt.peer.id = "0"
  return datt
}

describe('ContentDiscovery', function () {
  var contentDiscovery

  before(function () {
    contentDiscovery = new ContentDiscovery()
  })

  describe('ContentDiscovery', function () {
    it('should exist test contentDiscovery', function () {
      should.exist(contentDiscovery)
    })
  })

  var datt = getDattObject()

  describe('notHandleOwnMessage', function () {
    it('should not handle message coming from itself', function () { 
      var message = Message.requestPeersForHash("testhash", datt)
      return contentDiscovery.handleContentDiscoveryRequest(message, datt).then(function(result) {
        result.should.equal("Own message")
      })
    })
  })

  describe('handleOtherMessage', function () {
    it('should handle message with another id and send an announcement because it has this content', function () { 
      datt.peer.id = "1"
      var message = Message.requestPeersForHash("testhash", datt)      
      datt.peer.id = "0"
      return contentDiscovery.handleContentDiscoveryRequest(message, datt).then(function(result) {
        result.should.eql(["broadcasted","sentMessage"])
      })
    })
  })

  describe('notHandleMessageTwice', function () {
    it('should not propagate the same message twice', function () { 
      datt.peer.id = "1"
      var message = Message.requestPeersForHash("testhash", datt)      
      datt.peer.id = "0"
      return contentDiscovery.handleContentDiscoveryRequest(message, datt).then(function(result) {
        result.should.equal("Already seen message. Stop propagating")
      })
    })
  })  

  describe('notHavingContent', function () {
    it('should propagate message and not send announcement', function () { 
      datt.peer.id = "1"
      var message = Message.requestPeersForHash("testhash2", datt)      
      datt.peer.id = "0"
      return contentDiscovery.handleContentDiscoveryRequest(message, datt).then(function(result) {
        result.should.eql(['broadcasted', 'Did not have content'])
      })
    })
  })

  // Create datt object with failing send
  var datt2 = getDattObject()
  datt2.sendMessage = function(msg, sender) {
    var deferred = q.defer()
    deferred.reject("send error")
    return deferred.promise
  }

  describe('throwError', function () {
    it('should throw error since cannot send announcement', function () { 
      datt2.peer.id = "2"
      var message = Message.requestPeersForHash("testhash", datt2)      
      datt2.peer.id = "0"
      return contentDiscovery.handleContentDiscoveryRequest(message, datt).fail(function(error) {
        error.should.equal("send error")
      })
    })
  })

})
