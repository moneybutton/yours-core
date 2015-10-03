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

let Layout = React.createClass({
  getInitialState: function () {
    return {
      status: 'uninitialized'
    }
  },
  componentWillMount: function () {
    let dattcore = this.props.dattcore
    return dattcore.init().then(() => {
      this.setState({
        status: 'initialized'
      })
    })
    .catch(err => {
      this.setState({
        status: 'error initializing: ' + err
      })
    })
  },
  propTypes: {
    apptitle: React.PropTypes.string,
    dattcore: React.PropTypes.object
  },
  render: function () {
    if (this.state.status !== 'initialized') {
      return (
        <div className='container'>
          <div className='row page-header'>
            <div className='col-md-12'>
              <img src='/logo.svg' alt='' />
              <h1>{this.props.apptitle}</h1>
            </div>
          </div>

          <div className='row'>
            <div className='col-md-12'>
              <p>
              status of dattcore: {this.state.status}
              </p>
            </div>
          </div>
        </div>
      )
    } else {
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
              status of dattcore: {this.state.status}
              </p>
            </div>

            <div className='col-md-4 side-boxes'>
              <BoxUser dattcore={this.props.dattcore}/>
              <BoxBitcoin dattcore={this.props.dattcore} bitsbalance={0}/>
              <BoxContent postsnumber={0}/>
              <BoxPeer peersnumber={0}/>
            </div>
          </div>
        </div>
      )
    }
  }
})

module.exports = Layout
