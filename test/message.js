var should = require('should');
var Message = require('../lib/message');
var User = require('../lib/user');

describe('Message', function() {
  var message;
  var user;

  before(function() {
    message = new Message(Message.Type.ANNOUNCE_IDENTITY, 'body');
    user = new User('username', 'password');
  });

  describe('Message', function() {

    it('should exist test message', function() {
      should.exist(message);
    });

  });

  describe('@serialize', function() {

    it('should serialize this message', function() {
      Message.serialize(message).should.equal('{"type":1,"body":"body"}');
    });

  });

  describe('#serialize', function() {

    it('should serialize this message', function() {
      message.serialize().should.equal('{"type":1,"body":"body"}');
    });

  });

  describe('@getIdentityAnnouncementForUser', function() {

    it('should produce this known announcement', function() {
      JSON.stringify(Message.getIdentityAnnouncementForUser(user)).should.equal('{"type":1,"body":"username_1DRb9bha3BqeVQmLiXAKVwmoLm3eDhUNCx_029dd0864fd2134e82616d12f54c6f35281e056824ca983456fc4384e0eb047d0b"}');
    });

  });

});
