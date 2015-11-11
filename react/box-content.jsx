/**
 * Box Content
 * ===========
 *
 * Box for the "user's content".
 */
'use strict'
let React = require('react')

let BoxContent = React.createClass({
  propTypes: {
    postsnumber: React.PropTypes.number
  },

  render: function () {
    return (
      <div className='info-box'>
        <h2>My Content</h2>
        <p>Number of posts: {this.props.postsnumber}</p>
        <p>
          <button className='btn btn-default'>Export</button>
          <button className='btn btn-default'>Import</button>
        </p>
      </div>
    )
  }
})

module.exports = BoxContent
