var assert = require('assert');
var maki = require('..');
var request = require('supertest');

describe('maki', function(){

  it('should inherit from event emitter', function(done){
    var maki = maki();
    maki.on('foo', done);
    maki.emit('foo');
  });

  it('should be callable', function(){
    var maki = maki();
    assert(typeof maki, 'function');
  });

});
