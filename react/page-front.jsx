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
    hidden: React.PropTypes.bool
  },
    
    render: function () {
	var classes = (this.props.showContentList || this.props.showFormNewContent?"":"hidden")
	return (
		<div className={classes}>
		{
		    (() => { return (this.props.showContentList? <ContentList dattcore={this.props.dattcore}/> : undefined ) }).bind(this)()
		}
	    {
		(() => {
		    return (this.props.showFormNewContent? <FormNewContent dattcore={this.props.dattcore}/> : undefined ) }).bind(this)()
	    }
		</div>
    )
  }
})

module.exports = PageFront
