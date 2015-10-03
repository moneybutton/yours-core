/* global describe,it */
'use strict'
let should = require('should')
let Layout = require('../../views/layout.jsx')
let React = require('react')
let dattcore = require('./dattcore')

describe('Layout', function () {
  let layout = <Layout apptitle='Datt' dattcore={dattcore}/>

  it('should exist', function () {
    should.exist(Layout)
    let layout = <Layout appname='Datt'/>
    should.exist(layout)
    layout.props.appname.should.equal('Datt')
  })

  describe('#render', function () {
    it('should render to a string that contains the apptitle', function () {
      React.renderToString(layout).includes('Datt').should.equal(true)
    })
  })
})
