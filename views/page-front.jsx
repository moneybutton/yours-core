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
    dattcoreStatus: React.PropTypes.string
  },
  render: function () {
    return (
      <div>
        <ContentList dattcore={this.props.dattcore} dattcoreStatus={this.props.dattcoreStatus}/>
        <FormNewContent dattcore={this.props.dattcore} dattcoreStatus={this.props.dattcoreStatus}/>
      </div>
    )
  }
})

module.exports = PageFront
