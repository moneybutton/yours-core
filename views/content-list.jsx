/**
 * ContentList
 * ===========
 *
 * A list of content titles with links to their pages.
 */
'use strict'
let React = require('react')

let ContentList = React.createClass({
  getInitialState: function () {
    return {
      contentList: []
    }
  },
  setStateFromDattcore: function () {
    let dattcore = this.props.dattcore
    return dattcore.asyncGetRecentContentAuth().then(contentauths => {
      let contentList = contentauths.map(contentauth => {
        let key = contentauth.cachehash.toString('hex')
        let content = contentauth.getContent()
        let title = content.title
        let label = content.label
        let name = content.name
        let body = content.body
        return {key, title, name, label, body}
      })
      this.setState({contentList})
    })
  },
  componentWillMount: function () {
    return this.setStateFromDattcore()
  },
  componentWillReceiveProps: function () {
    return this.setStateFromDattcore()
  },
  propTypes: {
    dattcore: React.PropTypes.object,
    dattcoreStatus: React.PropTypes.string
  },
  render: function () {
    let contentList = this.state.contentList.map(obj => {
      return (
        <li className='content-list-item' key={obj.key}>
          <h2>
            <a href='#'>{obj.title}</a>
          </h2>
          <div className='author-name'>{obj.name}</div>
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
