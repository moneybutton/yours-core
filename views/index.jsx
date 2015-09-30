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

          <div className='col-md-4 side-boxes'>
            <UserBox mnemonic={this.state.mnemonic}/>
            <BitcoinBox bitsbalance={0}/>
            <ContentBox postsnumber={0}/>
            <PeerBox peersnumber={0}/>
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
    bitsbalance: React.PropTypes.number
  },
  render: function () {
    return (
      <div className='info-box'>
        <h2>My Bitcoin</h2>
        <p>Your balance: {this.props.bitsbalance} bits</p>
        <p><button className='btn btn-default'>Send</button>
        <button className='btn btn-default'>Receive</button></p>
      </div>
    )
  }
})

let ContentBox = React.createClass({
  propTypes: {
    postsnumber: React.PropTypes.number
  },
  render: function () {
    return (
      <div className='info-box'>
        <h2>My Content</h2>
        <p>Number of posts: {this.props.postsnumber}</p>
        <p><button className='btn btn-default'>Export</button>
        <button className='btn btn-default'>Import</button></p>
      </div>
    )
  }
})

let PeerBox = React.createClass({
  propTypes: {
    peersnumber: React.PropTypes.number
  },
  render: function () {
    return (
      <div className='info-box'>
        <h2>My Peers</h2>
        <p>Number of peers: {this.props.peersnumber}</p>
      </div>
    )
  }
})

module.exports = Index
