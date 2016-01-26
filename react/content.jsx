'use strict'

let React = require('react')
let asink = require('asink')

let ContentHeader = require('./content-header.jsx')

let Content = React.createClass({
    'getInitialState': function () {
	return {
	    'content': null
	}
    },
    
    'componentWillMount': function () {
	return this.setStateFromDattCore()
    },

    componentDidUpdate: function () {
	return this.setStateFromDattCore()
    },
    
    'setStateFromDattCore': function () {
	return asink(function *() {
	    if(!this.props.contentkey) {
		return
	    }
	    
	    let dattcore = this.props.dattcore
	    let DattCore = dattcore.constructor
	    
	    let contentauth = yield dattcore.corecontent.asyncGetContentAuth(this.props.contentkey)
	    
	    if(contentauth && contentauth.getContent()) {
		let key = contentauth.cachehash.toString('hex')
		let address = contentauth.address
		let addressString = yield DattCore.CryptoWorkers.asyncAddressStringFromAddress(contentauth.address)
		let content = contentauth.getContent()
		let title = content.title
		let label = content.label
		let name = content.name
		let body = content.body
		
		let contentObj = {key, address, addressString, title, name, label, body}
	
		this.setState({
		    'content': contentObj
		})
	    }
	}, this)
    },
    'render': function() {
	let content = this.state.content
	let contentkey = this.props.contentkey
	let dattcore = this.props.dattcore
	
	if(content === null) {
	    return (<div className='container-fluid'><span>Loading content {contentkey}...</span></div>)
	}
	
	return (
		<div className='container-fluid content-view'>
		<div className='row'>
		<div className='col-md-offset-2 col-md-6'>
		<ContentHeader content={content} dattcore={dattcore} />
		</div>
		</div>
		<div className='row'>
		<div className='col-md-offset-3 col-md-6'>
		<p>{content.body}</p>
		</div>
		</div>
		</div>
	)
	
    }
})

module.exports = Content
