/* global it,describe,before */
var should = require('should')
var Message = require('../lib/message')
var User = require('../lib/user')
/**
describe('Message', function () {
  var message
  var user

  before(function () {
    message = new Message(Message.Type.ANNOUNCE_IDENTITY, 'body')
    user = new User('username', 'password')
    return user.init()
  })

  describe('Message', function () {
    it('should exist test message', function () {
      should.exist(message)
    })

  })

  describe('@serialize', function () {
    it('should serialize this message', function () {
      Message.serialize(message).should.equal('{"type":1,"body":"body"}')
    })

  })

  describe('#serialize', function () {
    it('should serialize this message', function () {
      message.serialize().should.equal('{"type":1,"body":"body"}')
    })

  })

  describe('@getIdentityAnnouncementForUser', function () {
    it('should produce this known announcement', function () {
      JSON.stringify(Message.getIdentityAnnouncementForUser(user)).should.equal('{"type":1,"body":"username_19aM8TSmimwBsH9uVbS6SXigqM42fEzGtY_02af59b2cc4ebe9cc796f8076b095efaaed11f4f249805d3db18459f15be04de4f"}')
    })

  })

})
**/
