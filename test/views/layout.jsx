/* global describe,it */
'use strict'
let should = require('should')
let Layout = require('../../views/layout.jsx')
let React = require('react/addons')
let TestUtils = React.addons.TestUtils
let dattcore = require('./dattcore')
let dom = require('./dom')

describe('Layout', function () {
  let layout = <Layout apptitle='Datt' dattcore={dattcore}/>
  let domlayout

  it('should exist', function () {
    should.exist(Layout)
    let layout = <Layout appname='Datt'/>
    should.exist(layout)
    layout.props.appname.should.equal('Datt')
  })

  before(function () {
    // Note: All react test files must run dom.before()
    dom.before()

    domlayout = TestUtils.renderIntoDocument(<Layout apptitle='Datt' dattcore={dattcore}/>)
  })

  after(function () {
    // Note: All react test files must run dom.after()
    dom.after()
  })

  describe('#getInitialState', function () {
    it('should return this known state', function () {
      domlayout.getInitialState().dattcore_status.should.equal('uninitialized')
    })
  })

  describe.skip('#componentWillMount', function () {
    it('should initialize dattcore', function () {
      return domlayout.componentWillMount().then(() => {
        domlayout.state.dattcore_status.should.equal('initialized')
      })
    })
  })

  describe('#render', function () {
    it('should render to a string that contains the apptitle', function () {
      React.renderToString(layout).includes('Datt').should.equal(true)
    })
  })
})
