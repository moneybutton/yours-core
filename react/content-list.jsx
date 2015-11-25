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
      let contentauths = yield dattcore.asyncGetRecentContentAuth()
      let contentList = contentauths.map(contentauth => {
        let key = contentauth.cachehash.toString('hex')
        let address = contentauth.address.toHex()
        let content = contentauth.getContent()
        let title = content.title
        let label = content.label
        let name = content.name
        let body = content.body
        return {key, address, title, name, label, body}
      })
      this.setState({contentList})
    }.bind(this))
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

  render: function () {
    let contentList = this.state.contentList.map(obj => {
      return (
        <li className='content-list-item' key={obj.key}>
          <h2>
            <a href='#'>{obj.title}</a>
          </h2>
          <div className='author-name'>{obj.name} | {obj.address}</div>
        </li>
      )
    })
    return (
      <ul className='content-list'>
        {contentList}
      </ul>
    )
  }
})

module.exports = ContentList
