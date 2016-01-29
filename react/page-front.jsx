/**
 * PageFront
 * =========
 *
 * This is the 'front page' that lists all the content.
 */
'use strict'
let React = require('react')
let FormNewContent = require('./form-new-content.jsx')
let ContentList = require('./content-list.jsx')

let PageFront = React.createClass({
  getInitialState: function () {
    return {}
  },

  propTypes: {
    dattcore: React.PropTypes.object,
    dattcoreStatus: React.PropTypes.string,
    view: React.PropTypes.object,
    updateView: React.PropTypes.func
  },

  render: function () {
      return (
      <div>
          <ContentList key="contentList" dattcore={this.props.dattcore} updateView={this.props.updateView}/>
      </div>
    )
  }
})

module.exports = PageFront
