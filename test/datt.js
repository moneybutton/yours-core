/* global it,describe,before */
var Datt = require('../lib/datt')
var should = require('should')

describe('Datt', function () {
  var datt

  before(function () {
    datt = new Datt()
  })

  describe('Datt', function () {

    it('should see the global datt', function () {
      should.exist(datt)
    })

  })

})
