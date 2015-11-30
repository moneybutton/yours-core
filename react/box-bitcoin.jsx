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
      depositAddress: '',
      blockheightnum: 0
    }
  },

  propTypes: {
    bitsbalance: React.PropTypes.number,
    dattcore: React.PropTypes.object
  },

  setStateFromDattCore: function () {
    return asink(function *() {
      let dattcore = this.props.dattcore
      let DattCore = dattcore.constructor
      let depositAddress = ''

      if (dattcore.isinitialized) {
        // We always use the 0th address for the deposit address. TODO: This is
        // bad practice for privacy reasons. Every deposit should be associated
        // with a new address.
        let address = yield dattcore.asyncGetAddress(0)
        depositAddress = yield DattCore.CryptoWorkers.asyncAddressStringFromAddress(address)
      }

      let info = yield dattcore.asyncGetLatestBlockInfo()
      this.setState({
        blockheightnum: info.height,
        depositAddress: depositAddress
      })
    }.bind(this))
  },

  componentDidMount: function () {
    return this.setStateFromDattCore()
  },

  componentWillReceiveProps: function () {
    return this.setStateFromDattCore()
  },

  render: function () {
    return (
      <div className='info-box'>
        <h2>My Bitcoin</h2>
        <p>Your balance: {this.props.bitsbalance} bits</p>
        <p><button className='btn btn-default'>Send</button>
        <button className='btn btn-default'>Receive</button></p>
        <p>Latest block height: {this.state.blockheightnum}</p>
        <p>Deposit: {this.state.depositAddress}</p>
      </div>
    )
  }
})

module.exports = BoxBitcoin
