/**
 * Box Peer
 * ===========
 *
 * Box for peers.
 */
'use strict'
let React = require('react')

let BoxPeer = React.createClass({
  propTypes: {
    peersnumber: React.PropTypes.number
  },
  render: function () {
    return (
      <div className='info-box'>
        <h2>My Peers</h2>
        <p>Number of peers: {this.props.peersnumber}</p>
      </div>
    )
  }
})

module.exports = BoxPeer
