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
      blockheightnum: 0
    }
  },

  propTypes: {
    bitsbalance: React.PropTypes.number,
    dattcore: React.PropTypes.object
  },

  componentDidMount: function () {
    return asink(function *() {
      let dattcore = this.props.dattcore
      let info = yield dattcore.asyncGetLatestBlockInfo()
      this.setState({
        blockheightnum: info.height
      })
    }.bind(this))
  },

  render: function () {
    return (
      <div className='info-box'>
        <h2>My Bitcoin</h2>
        <p>Your balance: {this.props.bitsbalance} bits</p>
        <p><button className='btn btn-default'>Send</button>
        <button className='btn btn-default'>Receive</button></p>
        <p>Latest block height: {this.state.blockheightnum}</p>
      </div>
    )
  }
})

module.exports = BoxBitcoin
