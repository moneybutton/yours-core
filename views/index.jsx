/* global DattCore */
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
    dattcore = DattCore.create()
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
    propname: React.PropTypes.string
  },
  render: function () {
    return (
      <div>
        <p>
        status of dattcore: {this.state.status}<br/>
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
