/* global describe,it */
var DattNode = require('../index')
var Main = require('../lib/main')
var should = require('should')

describe('DattNode', function () {

  it('should have these components', function () {
    should.exist(DattNode.Content)
    should.exist(DattNode.ContentStore)
    should.exist(DattNode.Main)
    should.exist(DattNode.Message)
    should.exist(DattNode.Peer)
    should.exist(DattNode.User)
    should.exist(DattNode.bitcore)
    should.exist(DattNode.logger)
  })

  describe('@create', function () {

    it('should make a new "Main"', function () {
      var main = DattNode.create()
      should(main instanceof Main).equal(true)
    })

  })

})
