'use strict'
let React = require('react')
let asink = require('asink')

let ContentHeader = React.createClass({
    'handleSend': function (address, el) {
	return asink(function *() {
	    el.preventDefault()
	    let dattcore = this.props.dattcore
	    let satoshis = 5000 * 1e2 // 5000 bits converted to satoshis
	    yield dattcore.asyncBuildSignAndSendTransaction(address, satoshis)
	}, this)
    },

    'render': function () {
	let content = this.props.content
	return (
		<div className='container-fluid content-header'>
		<div className='row'>
		<div className='col-md-1'>
		<ul>
		<li>
		<span aria-hidden='true' onClick={this.handleSend.bind(this, content.address)} className='glyphicon glyphicon-menu-up'></span>
		</li>
		<li>
		<span aria-hidden='true' className='glyphicon glyphicon-menu-down gray'></span>
		</li> 
		</ul>
		</div>
		<div className='col-md-10 col-md-offset-1'>
		<h2>
		<a href={'#/content/'+content.key} >{content.title}</a>
		</h2>
		{[(false?(<form><button type='pay' className='btn btn-default' onClick={this.handleSend.bind(this, content.address)}>Send 5000 Bits</button></form>):null)]}
		<div className='author-information'>{content.name} | {content.addressString}</div>
		</div>
		</div>
		</div>
	)
    }
})

module.exports = ContentHeader
