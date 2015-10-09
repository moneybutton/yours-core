/**
 * Layout
 * =====
 *
 * This is the main layout component which frames every page.
 */
'use strict'
let React = require('react')
let BoxContent = require('./box-content.jsx')
let BoxBitcoin = require('./box-bitcoin.jsx')
let BoxPeer = require('./box-peer.jsx')
let BoxUser = require('./box-user.jsx')
let PageFront = require('./page-front.jsx')

let Layout = React.createClass({
  getInitialState: function () {
    return {
      dattcoreStatus: 'uninitialized'
    }
  },
  componentWillMount: function () {
    let dattcore = this.props.dattcore
    return dattcore.asyncInitialize().then(() => {
      this.setState({
        dattcoreStatus: 'initialized'
      })
    })
    .catch(err => {
      this.setState({
        dattcoreStatus: 'error initializing: ' + err
      })
    })
  },
  propTypes: {
    apptitle: React.PropTypes.string,
    dattcore: React.PropTypes.object
  },
  render: function () {
    let dattcore = this.props.dattcore
    let dattcoreStatus = this.state.dattcoreStatus
    return (
      <div className='container'>
        <div className='row page-header'>
          <div className='col-md-12'>
            <img src='/logo.svg' alt='' />
            <h1>{this.props.apptitle}</h1>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-8'>
            <PageFront dattcore={dattcore} dattcoreStatus={dattcoreStatus}/>
          </div>

          <div className='col-md-4 side-boxes'>
            <BoxUser dattcore={dattcore} dattcoreStatus={dattcoreStatus}/>
            <BoxBitcoin dattcore={dattcore} dattcoreStatus={dattcoreStatus} bitsbalance={0}/>
            <BoxContent postsnumber={0}/>
            <BoxPeer peersnumber={0}/>
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
