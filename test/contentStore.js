var bitcore = require('bitcore')
var q = require('q')
var should = require('should')
var ContentStore = require('../lib/contentStore')

describe('ContentStore', function() {
  var contentStore
  var content = "test"
  var hash = bitcore.crypto.Hash.sha256(new Buffer(content))

  before(function() {
    contentStore = new ContentStore()
  })

  describe('ContentStore', function() {

    it('should see the global content store', function() {
      should.exist(contentStore)
    })

  })

  describe('#putContent', function() {
    
    it('should put this content', function() {
      return q.when(contentStore.putContent(content)).then(function (hashhex) {
        hashhex.should.equal(hash.toString('hex'))
      })
    })

  })

  describe('#getContent', function() {

    it('should get this content', function() {
      var hashhex = hash.toString('hex')
      return q.when(contentStore.getContent(hashhex)).then(function (val) {
        val.should.equal(content)
      })
    })

  })

})
