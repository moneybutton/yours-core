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
    let components = []

    if (this.props.view.contentList) {
      components.push(<ContentList dattcore={this.props.dattcore} updateView={this.props.updateView}/>)
    }
    if (this.props.view.formNewContent) {
      components.push(<FormNewContent dattcore={this.props.dattcore}/>)
    }

    return (<div>{components}</div>)
  }
})

module.exports = PageFront
