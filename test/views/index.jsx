/* global describe,it */
'use strict'
let should = require('should')
let Index = require('../../views/index.jsx')
let React = require('react')

describe('Index', function () {
  it('should exist', function () {
    should.exist(Index)
    let index = <Index appname='Datt'/>
    should.exist(index)
    index.props.appname.should.equal('Datt')
  })
})
