/**
 * ContentList
 * ===========
 *
 * A list of content titles with links to their pages.
 */
'use strict'
let React = require('react')
let asink = require('asink')

let ContentList = React.createClass({
  getInitialState: function () {
    return {
      contentList: []
    }
  },

  setStateFromDattCore: function () {
    return asink(function *() {
      let dattcore = this.props.dattcore
      let DattCore = dattcore.constructor
      let contentauths = yield dattcore.asyncGetRecentContentAuth()
      let contentList = []
      for (let contentauth of contentauths) {
        let key = contentauth.cachehash.toString('hex')
        let address = contentauth.address
        let addressString = yield DattCore.CryptoWorkers.asyncAddressStringFromAddress(contentauth.address)
        let content = contentauth.getContent()
        let title = content.title
        let label = content.label
        let name = content.name
        let body = content.body
        contentList.push({key, address, addressString, title, name, label, body})
      }
      this.setState({contentList})
    }, this)
  },

  componentWillMount: function () {
    this.monitorDattCore()
    return this.setStateFromDattCore()
  },

  componentWillReceiveProps: function () {
    return this.setStateFromDattCore()
  },

  monitorDattCore: function () {
    let dattcore = this.props.dattcore
    dattcore.on('peers-content-auth', this.handlePeersContentAuth)
    dattcore.on('content-content-auth', this.handleContentContentAuth)
  },

  handlePeersContentAuth: function () {
    return this.setStateFromDattCore()
  },

  handleContentContentAuth: function () {
    return this.setStateFromDattCore()
  },

  propTypes: {
    dattcore: React.PropTypes.object
  },

  handleSend: function (address, el) {
    return asink(function *() {
      el.preventDefault()
      let dattcore = this.props.dattcore
      let satoshis = 5000 * 1e2 // 5000 bits converted to satoshis
      yield dattcore.asyncBuildSignAndSendTransaction(address, satoshis)
    }, this)
  },
  resetView: function () {
      this.props.updateView('formNewContent', false)
      this.props.updateView('settings', false)      
  },
  render: function () {
    let contentList = this.state.contentList.map(obj => {
      return (
              <li className='content-list-item' key={obj.key}>
	      <div className='container-fluid'>
	      <div className='row'>
	      <div className='col-md-1'>
	      <ul>
	      <li>
	      <span aria-hidden='true' onClick={this.handleSend.bind(this, obj.address)} className='glyphicon glyphicon-menu-up'></span>
	      </li>
	      <li>
	      <span aria-hidden='true' className='glyphicon glyphicon-menu-down gray'></span>
	      </li> 
	      </ul>
	      </div>
	      <div className='col-md-10 col-md-offset-1'>
              <h2>
              <a href='#'>{obj.title}</a>
              </h2>
              {[(false?(<form><button type='pay' className='btn btn-default' onClick={this.handleSend.bind(this, obj.address)}>Send 5000 Bits</button></form>):null)]} 
              <div className='author-information'>{obj.name} | {obj.addressString}</div>
	      </div>
	      </div>
	      </div>
        </li>
      )
    })
    return (
    <div className='row' onClick={this.resetView}>
    <div className='col-md-6 col-md-offset-2'>
      <ul className='content-list'>
        {contentList}
      </ul>
      </div>
      </div>
    )
  }
})

module.exports = ContentList
