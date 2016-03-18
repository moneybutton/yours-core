/* global describe,it */
'use strict'
let should = require('should')
let Content = require('../lib/content')

describe('Content', function () {
  let contenthex = '7b226e616d65223a226d796e616d65222c226c6162656c223a226d796c6162656c222c227469746c65223a22636f6e74656e74207469746c65222c2274797065223a226d61726b646f776e222c22626f6479223a22636f6e74656e7420626f6479227d'

  it('should exist', function () {
    should.exist(Content)
    should.exist(Content())
  })

  describe('#toHex', function () {
    it('should convert this valid content into a hex string', function () {
      let content = Content('myname', 'mylabel', 'content title', 'markdown', 'content body')
      content.toHex().should.equal(contenthex)
    })
  })

  describe('#fromHex', function () {
    it('should get content from this known hex string', function () {
      let content = Content().fromHex(contenthex)
      content.name.should.equal('myname')
      content.label.should.equal('mylabel')
      content.title.should.equal('content title')
      content.type.should.equal('markdown')
      content.body.should.equal('content body')
    })
  })

  describe('#validate', function () {
    it('should not throw an error on this known-valid content', function () {
      Content().fromHex(contenthex).validate()
    })
  })
})
