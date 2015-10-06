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
      dattcore_status: 'uninitialized'
    }
  },
  componentWillMount: function () {
    let dattcore = this.props.dattcore
    return dattcore.init().then(() => {
      this.setState({
        dattcore_status: 'initialized'
      })
    })
    .catch(err => {
      this.setState({
        dattcore_status: 'error initializing: ' + err
      })
    })
  },
  propTypes: {
    apptitle: React.PropTypes.string,
    dattcore: React.PropTypes.object
  },
  render: function () {
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
            <p>
            status of dattcore: {this.state.dattcore_status}
            </p>
            <PageFront dattcore={this.props.dattcore} dattcore_status={this.state.dattcore_status}/>
          </div>

          <div className='col-md-4 side-boxes'>
            <BoxUser dattcore={this.props.dattcore} dattcore_status={this.state.dattcore_status}/>
            <BoxBitcoin dattcore={this.props.dattcore} dattcore_status={this.state.dattcore_status} bitsbalance={0}/>
            <BoxContent postsnumber={0}/>
            <BoxPeer peersnumber={0}/>
          </div>
        </div>
      </div>
    )
  }
})

module.exports = Layout
