/**
 * Box Bitcoin
 * ===========
 *
 * Box for bitcoin.
 */
'use strict'
let React = require('react')
let asink = require('asink')

let BoxBitcoin = React.createClass({
  getInitialState: function () {
    return {
      unconfirmedBalanceBits: 0,
      confirmedBalanceBits: 0,
      totalBalanceBits: 0,
      blockheightnum: 0,
      depositAddress: ''
    }
  },

  propTypes: {
    dattcore: React.PropTypes.object
  },

  setStateFromDattCore: function () {
    return asink(function *() {
      let dattcore = this.props.dattcore
      let info = yield dattcore.asyncGetLatestBlockInfo()
      this.setState({
        blockheightnum: info.height
      })
    }.bind(this))
  },

  componentWillMount: function () {
    this.monitorDattCore()
  },

  componentDidMount: function () {
    return this.setStateFromDattCore()
  },

  componentWillReceiveProps: function () {
    return this.setStateFromDattCore()
  },

  monitorDattCore: function () {
    let dattcore = this.props.dattcore
    dattcore.on('bitcoin-balance', this.handleBitcoinBalance)
  },

  handleBitcoinBalance: function (obj) {
    let unconfirmedBalanceBits = Math.round(obj.unconfirmedBalanceSatoshis / 100)
    let confirmedBalanceBits = Math.round(obj.confirmedBalanceSatoshis / 100)
    let totalBalanceBits = Math.round(obj.totalBalanceSatoshis / 100)
    this.setState({
      unconfirmedBalanceBits,
      confirmedBalanceBits,
      totalBalanceBits
    })
  },

  handleReceive: function () {
    return asink(function *() {
      let dattcore = this.props.dattcore
      let DattCore = dattcore.constructor
      let address = yield dattcore.asyncGetNewExtAddress()
      let depositAddress = yield DattCore.CryptoWorkers.asyncAddressStringFromAddress(address)
      this.setState({depositAddress})
    }.bind(this))
  },

  render: function () {
    return (
      <div className='info-box'>
        <h2>My Bitcoin</h2>
        <p>Confirmed balance: {this.state.confirmedBalanceBits} bits</p>
        <p>Unconfirmed balance: {this.state.unconfirmedBalanceBits} bits</p>
        <p>Total balance: {this.state.totalBalanceBits} bits</p>
        <p>Latest block height: {this.state.blockheightnum}</p>
        <p><button className='btn btn-default'>Send</button>
        <button className='btn btn-default' onClick={this.handleReceive}>Receive</button></p>
        <p>Deposit Address:<br/>{this.state.depositAddress}</p>
      </div>
    )
  }
})

module.exports = BoxBitcoin
