/* global describe,it */
var datt_node = require('../index')
var Main = require('../lib/main')
var should = require('should')

describe('datt_node', function () {

  it('should have these components', function () {
    should.exist(datt_node.Content)
    should.exist(datt_node.ContentStore)
    should.exist(datt_node.Main)
    should.exist(datt_node.Message)
    should.exist(datt_node.Peer)
    should.exist(datt_node.User)
    should.exist(datt_node.bitcore)
    should.exist(datt_node.logger)
  })

  describe('@createMain', function () {

    it('should make a new "Main"', function () {
      var main = datt_node.createMain()
      should(main instanceof Main).equal(true)
    })

  })

})
