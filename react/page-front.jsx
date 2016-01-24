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
		{
		    [
			(this.props.view.contentList? <ContentList dattcore={this.props.dattcore} updateView={this.props.updateView}/> : undefined ),
			(this.props.view.formNewContent? <FormNewContent dattcore={this.props.dattcore}/> : undefined )
		    ]
		}
		</div>
	)
  }
})

module.exports = PageFront
