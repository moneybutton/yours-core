/* global describe,it,before,after */
'use strict'
let Layout = require('../../react/layout.jsx')
let React = require('react')
let TestUtils = require('react-addons-test-utils')
let asink = require('asink')
let dattcore = require('./dattcore')
let dom = require('./dom')
let should = require('should')

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
      domlayout.getInitialState().dattcoreStatus.should.equal('uninitialized')
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
      return asink(function *() {
        let domlayout = TestUtils.renderIntoDocument(layout)
        yield domlayout.componentWillMount()
        domlayout.state.dattcoreStatus.should.equal('initialized')
      })
    })
  })
})
