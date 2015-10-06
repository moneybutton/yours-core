/**
 * PageFront
 * =========
 *
 * This is the 'front page' that lists all the content.
 */
'use strict'
let React = require('react')
let FormNewContent = require('./form-new-content.jsx')

let PageFront = React.createClass({
  getInitialState: function () {
    return {}
  },
  render: function () {
    return (
      <div>
        <p>Content here</p>
        <FormNewContent/>
      </div>
    )
  }
})

module.exports = PageFront
