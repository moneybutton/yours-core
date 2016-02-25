/**
 * PageFront
 * =========
 *
 * This is the 'front page' that lists all the content.
 */
'use strict'
let React = require('react')
let ContentList = require('./content-list.jsx')

let PageFront = React.createClass({
  getInitialState: function () {
    return {}
  },

  propTypes: {
    dattcore: React.PropTypes.object,
    dattcoreStatus: React.PropTypes.string,
    view: React.PropTypes.object,
    updateView: React.PropTypes.func,
    uiEvents: React.PropTypes.object,
    skipSetup: React.PropTypes.bool
  },

  render: function () {
    return (
      <div>
          <ContentList key='contentList' dattcore={this.props.dattcore} updateView={this.props.updateView} uiEvents={this.props.uiEvents} skipSetup={this.props.skipSetup} />
      </div>
    )
  }
})

module.exports = PageFront
