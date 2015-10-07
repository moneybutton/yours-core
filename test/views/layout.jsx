/* global describe,it */
'use strict'
let should = require('should')
let Layout = require('../../views/layout.jsx')
let TestUtils = require('react-addons-test-utils')
let React = require('react')
let dattcore = require('./dattcore')
let dom = require('./dom')

describe('Layout', function () {
  let layout = <Layout apptitle='Datt' dattcore={dattcore}/>

  it('should exist', function () {
    should.exist(Layout)
    let layout = <Layout apptitle='Datt'/>
    should.exist(layout)
    layout.props.apptitle.should.equal('Datt')
  })

  before(function () {
    // Note: All react test files must run dom.before()
    dom.before()
  })

  after(function () {
    // Note: All react test files must run dom.after()
    dom.after()
  })

  describe('#getInitialState', function () {
    it('should return this known state', function () {
      let domlayout = TestUtils.renderIntoDocument(layout)
      domlayout.getInitialState().dattcore_status.should.equal('uninitialized')
    })
  })

  describe('#props', function () {
    it('should have the right initial props', function () {
      let domlayout = TestUtils.renderIntoDocument(layout)
      domlayout.props.apptitle.should.equal('Datt')
      domlayout.props.dattcore.should.equal(dattcore)
    })
  })

  describe.skip('#componentWillMount', function () {
    it('should initialize dattcore', function () {
      let domlayout = TestUtils.renderIntoDocument(layout)
      return domlayout.componentWillMount().then(() => {
        domlayout.state.dattcore_status.should.equal('initialized')
      })
    })
  })
})
