/* global DattCore */
/**
 * Index
 * =====
 *
 * This is the main index page component, i.e. the front-page.
 */
'use strict'
let React = require('react')

let dattcore // global dattcore application - the p2p/db/logic of datt

let Index = React.createClass({
  getInitialState: function () {
    return {
      status: 'uninitialized',
      mnemonic: ''
    }
  },
  componentDidMount: function () {
    global.dattcore = DattCore.create()
    dattcore = global.dattcore
    dattcore.init().then(function () {
      this.setState({
        status: 'initialized',
        mnemonic: dattcore.user.mnemonic
      })
    }.bind(this))
    .catch(function (err) {
      this.setState({
        status: 'error initializing: ' + err
      })
    }.bind(this))
  },
  propTypes: {
    apptitle: React.PropTypes.string
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
            status of dattcore: {this.state.status}
            </p>
          </div>

          <div className='col-md-4'>
            <UserBox mnemonic={this.state.mnemonic}/>
            <BitcoinBox mnemonic={this.state.mnemonic}/>
            <ContentBox mnemonic={this.state.mnemonic}/>
            <PeerBox mnemonic={this.state.mnemonic}/>
          </div>
        </div>
      </div>
    )
  }
})

let UserBox = React.createClass({
  propTypes: {
    mnemonic: React.PropTypes.string
  },
  render: function () {
    return (
      <div className='info-box'>
        <h2>My User</h2>
        <p>Your mnemonic: {this.props.mnemonic}</p>
      </div>
    )
  }
})

let BitcoinBox = React.createClass({
  propTypes: {
    mnemonic: React.PropTypes.string
  },
  render: function () {
    return (
      <div className='info-box'>
        <h2>My Bitcoin</h2>
        <p>Your mnemonic: {this.props.mnemonic}</p>
      </div>
    )
  }
})

let ContentBox = React.createClass({
  propTypes: {
    mnemonic: React.PropTypes.string
  },
  render: function () {
    return (
      <div className='info-box'>
        <h2>My Content</h2>
        <p>Your mnemonic: {this.props.mnemonic}</p>
      </div>
    )
  }
})

let PeerBox = React.createClass({
  propTypes: {
    mnemonic: React.PropTypes.string
  },
  render: function () {
    return (
      <div className='info-box'>
        <h2>My Peers</h2>
        <p>Your mnemonic: {this.props.mnemonic}</p>
      </div>
    )
  }
})

module.exports = Index
