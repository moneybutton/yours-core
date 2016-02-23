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
      contentList: null
    }
  },

  setStateFromDattCore: function (skipSetup) {
    return asink(function *() {
      let dattcore = this.props.dattcore

      let DattCore = dattcore.constructor
      let contentauths = yield dattcore.asyncGetRecentContentAuth()
      let waitOnUserSetup = false

      if ((!contentauths || !contentauths.length) && !this.props.skipSetup && !skipSetup) {
        waitOnUserSetup = !(yield dattcore.asyncGetUserSetupFlag())
      }

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
        let comments = content.comments || []

        contentList.push({key, address, addressString, title, name, label, body, comments})
      }

      // doing this in case component is unmounted while waiting for 'yield' to return
      // for argument for not using isMounted see: https://facebook.github.io/react/blog/2015/12/16/ismounted-antipattern.html
      // here there is no dangling reference but 'yield' within asink
      if (this.isMounted()) {
        this.setState({contentList, waitOnUserSetup})
      }
    }, this)
  },

  componentWillMount: function () {
    this.monitorDattCore()
    return this.setStateFromDattCore()
  },

  componentWillUnmount: function () {
    this.unmonitorDattCore()
  },

  componentWillReceiveProps: function () {
    return this.setStateFromDattCore()
  },

  monitorDattCore: function () {
    let dattcore = this.props.dattcore
    let uiEvents = this.props.uiEvents

    dattcore.on('peers-content-auth', this.handlePeersContentAuth)
    dattcore.on('content-content-auth', this.handleContentContentAuth)
    uiEvents.on('refresh-content', this.handleRefreshContent)
  },

  unmonitorDattCore: function () {
    let dattcore = this.props.dattcore
    let uiEvents = this.props.uiEvents

    dattcore.removeListener('peers-content-auth', this.handlePeersContentAuth)
    dattcore.removeListener('content-content-auth', this.handleContentContentAuth)
    uiEvents.removeListener('refresh-content', this.handleRefreshContent)
  },

  handlePeersContentAuth: function () {
    return this.setStateFromDattCore()
  },

  handleContentContentAuth: function () {
    return this.setStateFromDattCore()
  },

  handleRefreshContent: function () {
    return this.setStateFromDattCore(true)
  },

  propTypes: {
    dattcore: React.PropTypes.object,
    updateView: React.PropTypes.func,
    uiEvents: React.PropTypes.object,
    skipSetup: React.PropTypes.bool
  },

  resetView: function () {
    this.props.updateView('formNewContent', false)
    this.props.updateView('settings', false)
    document.location.hash = '#/frontpage'
  },

  render: function () {
    let contentElement

    if (this.state.contentList && this.state.contentList.length) {
      let contentList = this.state.contentList.map(obj => {
        return (
        <li className='content-list-item' key={obj.key} >
            <ContentHeader content={obj} dattcore={this.props.dattcore} />
        </li>
        )
      })
      contentElement = (<ul className='content-list'>{contentList}</ul>)
    } else if (!this.state.waitOnUserSetup && this.state.contentList && !this.state.contentList.length) {
      contentElement = (<div className='no-content text-center vspacer10'><h4>Oops, there's no content!</h4><div className='vspacer05'>There's nothing on Datt to read right now... You should post something!<br/> (Why? You are probably on a private / test network.) </div><div className='vspacer05'></div></div>)
    } else {
      contentElement = (<div className='loading-content text-center vspacer10'><h4>Loading...</h4><div className='vspacer05'></div></div>)
    }

    return (
      <div className='container-fluid content-list-container' onClick={this.resetView}>
          <div className='row'>
              <div className='col-md-8 col-md-offset-2'>
                  {contentElement}
              </div>
          </div>
      </div>
    )
  }
})

module.exports = ContentList
