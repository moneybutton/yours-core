let React = require('react')

let TopMenu = React.createClass({
    render: function() {
	return (
		<div className='topMenu col-md-8 col-md-offset-3' id='header'>
		<ul className='menu'>
		<li className='selected'>VIEW ALL<img src='images/arrow.png'/></li>
		<li>MAIL</li>
		<li>SETTINGS</li>
		<li>BALANCE<span className='balance'>(0.0112)</span></li>
		</ul>
		<ul className='icons'>
		<li><img src='images/icon_new.png' /></li>
		<li><img src='images/icon_search.png' /></li>
		</ul>
		</div>
	);
    }
})

module.exports = TopMenu
