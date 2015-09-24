'use strict'
let DattNode = require('../lib')
let React = require('react')

let dattnode // global dattnode application - the p2p/db/logic of datt

let Index = React.createClass({
  getInitialState: function () {
    return {
      status: 'uninitialized',
      mnemonic: ''
    }
  },
  componentDidMount: function () {
    console.log('before initializing dattnode')
    dattnode = DattNode.create()
    dattnode.init().then(function () {
      console.log('after initializing dattnode')
      this.setState({
        status: 'initialized',
        mnemonic: dattnode.user.mnemonic
      })
    }.bind(this))
    .catch(function (err) {
      this.setState({
        status: 'error initializing: ' + err
      })
    }.bind(this))
  },
  propTypes: {
    propname: React.PropTypes.string
  },
  render: function () {
    return (
      <div>
        <p>
        status of dattnode: {this.state.status}<br/>
        name: {this.props.propname}
        </p>
        <User mnemonic={this.state.mnemonic}/>
      </div>
    )
  }
})

let User = React.createClass({
  propTypes: {
    mnemonic: React.PropTypes.string
  },
  render: function () {
    return <p>User mnemonic: {this.props.mnemonic}</p>
  }
})

module.exports = Index
