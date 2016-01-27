'use strict'
let React = require('react')
let BoxBitcoin = require('./box-bitcoin.jsx')
let BoxContent = require('./box-content.jsx')
let BoxDeveloper = require('./box-developer.jsx')
let BoxPeer = require('./box-peer.jsx')
let BoxUser = require('./box-user.jsx')

let ConfigPanel = React.createClass({
  propTypes: {
    'dattcore': React.PropTypes.object,
    'numActiveConnections': React.PropTypes.number
  },
  render: function () {
    let dattcore = this.props.dattcore
    let numActiveConnections = this.props.numActiveConnections

    return (
    <div>
		<BoxUser dattcore={dattcore}/>
		<BoxBitcoin dattcore={dattcore}/>
		<BoxContent postsnumber={0}/>
		<BoxPeer peersnumber={numActiveConnections}/>
		<BoxDeveloper dattcore={dattcore}/>
		</div>
    )
  }
})

module.exports = ConfigPanel
