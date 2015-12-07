/**
 * Layout
 * =====
 *
 * This is the main layout component which frames every page.
 */
'use strict'
let BoxBitcoin = require('./box-bitcoin.jsx')
let BoxContent = require('./box-content.jsx')
let BoxDeveloper = require('./box-developer.jsx')
let BoxPeer = require('./box-peer.jsx')
let BoxUser = require('./box-user.jsx')
let TopMenu = require('./top-menu.jsx')
let PageFront = require('./page-front.jsx')
let React = require('react')
let asink = require('asink')

let Layout = React.createClass({
  getInitialState: function () {
    return {
      dattcoreStatus: 'uninitialized',
      numActiveConnections: 0
    }
  },

  componentWillMount: function () {
    return asink(function *() {
      let dattcore = this.props.dattcore
      try {
        yield dattcore.asyncInitialize()
        this.setState({
          dattcoreStatus: 'initialized'
        })
        this.monitorDattCore()
      } catch (err) {
        this.setState({
          dattcoreStatus: 'error initializing: ' + err
        })
      }
      yield dattcore.asyncNetworkInitialize()
    }.bind(this))
  },

  propTypes: {
    apptitle: React.PropTypes.string,
    dattcore: React.PropTypes.object
  },

  monitorDattCore: function () {
    let dattcore = this.props.dattcore
    dattcore.on('peers-connection', this.handlePeersConnection)
  },

  handlePeersConnection: function () {
    return asink(function *() {
      let dattcore = this.props.dattcore
      let n = yield dattcore.asyncNumActiveConnections()
      this.setState({
        numActiveConnections: n
      })
    }.bind(this))
  },

  render: function () {
    let dattcore = this.props.dattcore
    let dattcoreStatus = this.state.dattcoreStatus
    let numActiveConnections = this.state.numActiveConnections
    return (
      <div className='container'>
        <div className='row page-header'>
          <div className='col-md-12'>
            <img src='/logo.svg' alt='' />
            <h1>{this.props.apptitle}</h1>
          </div>
	  <TopMenu dattcore={dattcore}/>	  
        </div>

        <div className='row'>
          <div className='col-md-8'>
            <PageFront dattcore={dattcore}/>
          </div>

          <div className='col-md-4 side-boxes'>
            <BoxUser dattcore={dattcore}/>
            <BoxBitcoin dattcore={dattcore}/>
            <BoxContent postsnumber={0}/>
            <BoxPeer peersnumber={numActiveConnections}/>
            <BoxDeveloper dattcore={dattcore}/>
          </div>
        </div>

        <div className='row page-footer'>
          <div className='col-md-12'>
            <div className='version-number'>
              <p>Status of dattcore: {dattcoreStatus}</p>
              <p>Datt v{dattcore.version}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

module.exports = Layout
