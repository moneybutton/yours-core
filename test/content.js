var Content = require('../lib/content');
var should = require('should');

describe('Content', function() {
  var content;

  before(function() {
    content = new Content('data', 'owner');
  });

  describe('Content', function() {

    it('should exist test content', function() {
      should.exist(content);
    });

  });

  describe('@serialize', function() {

    it('should serialize this known content', function() {
      Content.serialize(content).should.equal('{"data":"data","owner":"owner"}');
    });

  });

});
