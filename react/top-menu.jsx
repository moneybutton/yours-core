let React = require('react')

let TopMenu = React.createClass({
    propTypes: {
	dattcore: React.PropTypes.object
    },
    getInitialState: function() {
	return {
	    totalBalanceBits: 0
	}
    },
    componentWillMount: function () {
	this.monitorDattCore()
    },
    monitorDattCore: function () {
	let dattcore = this.props.dattcore
	dattcore.on('bitcoin-balance', function(obj) {
	    let totalBalanceBits = Math.round(obj.totalBalanceSatoshis / 100)
	    this.setState({totalBalanceBits})
	}.bind(this))
    },
    viewAllClicked: function() {
	this.props.dattcore.emit('ui-layout-toggle-view', 'contentList')
    },
    newClicked: function() {
	this.props.dattcore.emit('ui-layout-toggle-view', 'formNewContent')
    },
    settingsClicked: function() {
	this.props.dattcore.emit('ui-layout-toggle-view', 'settings')
    },
    render: function() {
	return (
		<div className='topMenu col-md-8 col-md-offset-3' id='header'>
		<ul className='menu'>
		<li className='selected' onClick={this.viewAllClicked}>VIEW ALL<img src='images/arrow.png'/></li>
		<li>MAIL</li>
		<li onClick={this.settingsClicked}>SETTINGS</li>
		<li>BALANCE<span className='balance'>( {this.state.totalBalanceBits} bits )</span></li>
		</ul>
		<ul className='icons'>
		<li onClick={this.newClicked}><img src='images/icon_new.png' /></li>
		<li><img src='images/icon_search.png' /></li>
		</ul>
		<div className="search_bar">
		<form action="#">
		<input type="text" className="search_input" placeholder="Search..." />
		</form> 
		</div>
		</div>
	);
    }
})

module.exports = TopMenu
