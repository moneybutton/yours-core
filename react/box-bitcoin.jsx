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
      depositAddress: '',
      toAddress: '',
      toAmountBitsString: ''
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
    }, this)
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
    let initBalances = dattcore.getLastBalances()
    if (initBalances) {
      this.handleBitcoinBalance(initBalances)
    }
    let initBlockInfo = dattcore.getLastBlockInfo()
    if (initBlockInfo) {
      this.handleBlockInfo(initBlockInfo)
    }
    dattcore.on('bitcoin-balance', this.handleBitcoinBalance)
    dattcore.on('bitcoin-block-info', this.handleBlockInfo)
  },

  handleBitcoinBalance: function (obj) {
    let unconfirmedBalanceBits = Math.round(obj.unconfirmedBalanceSatoshis / 100)
    let confirmedBalanceBits = Math.round(obj.confirmedBalanceSatoshis / 100)
    let totalBalanceBits = Math.round(obj.totalBalanceSatoshis / 100)

    this.setState({
      unconfirmedBalanceBits,
      confirmedBalanceBits,
      totalBalanceBits})
  },

  handleBlockInfo: function (info) {
    if (info && info.height && info.height !== this.state.blockheightnum) {
      this.setState({
        blockheightnum: info.height
      })
    }
  },

  handleReceive: function () {
    return asink(function *() {
      let dattcore = this.props.dattcore
      let DattCore = dattcore.constructor
      let address = yield dattcore.asyncGetNewExtAddress()
      let depositAddress = yield DattCore.CryptoWorkers.asyncAddressStringFromAddress(address)
      this.setState({depositAddress})
    }, this)
  },

  handleToAddressChange: function (el) {
    this.setState({
      toAddress: el.target.value
    })
  },

  handleToAmountChange: function (el) {
    this.setState({
      toAmount: el.target.value
    })
  },

  handleSend: function (el) {
    return asink(function *() {
      el.preventDefault()
      let dattcore = this.props.dattcore
      let DattCore = dattcore.constructor
      let toAddressString = this.state.toAddress
      let toAmountBits = parseInt(this.state.toAmount, 10)
      let satoshis = toAmountBits * 100
      let address = yield DattCore.CryptoWorkers.asyncAddressFromAddressString(toAddressString)
      yield dattcore.asyncBuildSignAndSendTransaction(address, satoshis)
      this.setState({
        toAddress: '',
        toAmount: ''
      })
    }, this)
  },

  render: function () {
    return (
    <div className='info-box'>
        <h2>My Bitcoin</h2>
        <p>Confirmed balance: {this.state.confirmedBalanceBits} bits</p>
        <p>Unconfirmed balance: {this.state.unconfirmedBalanceBits} bits</p>
        <p>Total balance: {this.state.totalBalanceBits} bits</p>
        <p>Latest block height: {this.state.blockheightnum}</p>
        <p>
          <button className='btn btn-default' onClick={this.handleReceive}>Receive</button>
        </p>
        <p>Deposit Address:<br/>{this.state.depositAddress}</p>
        <form>
          <div className='form-group'>
            <label htmlFor='toAddress'>To Address</label>
            <input type='text' className='form-control' id='toAddress' placeholder='Label' onChange={this.handleToAddressChange} value={this.state.toAddress}/>
          </div>
          <div className='form-group'>
            <label htmlFor='toAmount'># of Bits</label>
            <input type='text' className='form-control' id='toAmount' placeholder='Label' onChange={this.handleToAmountChange} value={this.state.toAmount}/>
          </div>
          <button type='submit' className='btn btn-default' onClick={this.handleSend}>Send</button>
        </form>
      </div>
    )
  }
})

module.exports = BoxBitcoin
