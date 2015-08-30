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


describe('Message', function () {

  describe('@fromObject', function () {
    it('should be able to create a valid message from a parsed JSON object', function () {
      var str = '{"type":5,"body":{"param1":"hello","param2":"world"}}'
      var msg = Message.fromObject(JSON.parse(str))
      msg.type.should.equal(5)
      msg.body.should.exist
      msg.body.param1.should.equal('hello')
      msg.body.param2.should.equal('world')
      msg.serialize().should.equal(str)
    })

    it('should fail trying to create a Message from invalid object', function () {
      var str1 = '{}'
      Message.fromObject.bind(null, JSON.parse(str1)).should.throw()
      var str2 = '{"type":5,"boddy":{"param1":"hello","param2":"world"}}'
      Message.fromObject.bind(null, JSON.parse(str2)).should.throw()
      var str3 = '{"typ":5,"body":{"param1":"hello","param2":"world"}}'
      Message.fromObject.bind(null, JSON.parse(str3)).should.throw()
    })

  })

})
