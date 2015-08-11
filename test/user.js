var should = require('should');
var User = require('../lib/user');

describe('User', function() {
  var user;

  before(function() {
    user = new User('username', 'password');
  });

  describe('User', function() {

    it('should exist test user', function() {
      should.exist(user);
    });

  });

  describe('#serialize', function() {

    it('should serialize this known user', function() {
      user.serialize().should.equal('username_1DRb9bha3BqeVQmLiXAKVwmoLm3eDhUNCx_029dd0864fd2134e82616d12f54c6f35281e056824ca983456fc4384e0eb047d0b');
    });

  });

  describe('#sign', function() {

    it('should produce this known signature', function() {
      // this is possible thanks to deterministic K, a.k.a. RFC 6979
      user.sign('data').toCompact().toString('hex').should.equal('00b329bb5fbedb5702c54cc09c008f7748aefbc9cc17aa520394d96af251b73c694ffca2faa4f824a6ec5996c78894a7d3ddf9ebb59b7be559e7d6060ba319750f');
    });

  });

});
