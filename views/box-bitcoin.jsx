/**
 * Box Bitcoin
 * ===========
 *
 * Box for bitcoin.
 */
'use strict'
let React = require('react')

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
    let dattcore = this.props.dattcore
    return dattcore.asyncGetLatestBlockInfo().then(info => {
      this.setState({
        blockheightnum: info.height
      })
    })
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
