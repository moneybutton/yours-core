/**
 * Box Developer
 * =============
 *
 * Box for developers who are working on Datt.
 */
'use strict'
let React = require('react')

let BoxDeveloper = React.createClass({
  propTypes: {
    dattcore: React.PropTypes.object
  },

  handleDestroyDatabase: function () {
    let dattcore = this.props.dattcore
    return dattcore.db.asyncDestroy()
  },

  render: function () {
    return (
      <div className='info-box'>
        <h2>Developer Tools</h2>
        <button className='btn btn-default' onClick={this.handleDestroyDatabase}>Destroy Database</button>
      </div>
    )
  }
})

module.exports = BoxDeveloper
