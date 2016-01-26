/**
 * ContentList
 * ===========
 *
 * A list of content titles with links to their pages.
 */
'use strict'
let React = require('react')
let asink = require('asink')

let ContentHeader = require('./content-header.jsx')

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
    
  resetView: function () {
      this.props.updateView('formNewContent', false)
      this.props.updateView('settings', false)
      document.location.hash = '/frontpage'
  },
    
  render: function () {
    let contentList = this.state.contentList.map(obj => {
      return (
              <li className='content-list-item' key={obj.key} >
	      <ContentHeader content={obj} dattcore={this.props.dattcore} />
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
