/**
 * FormNewContent
 * ==============
 *
 * A form for submitting new content. This is designed to be mininalist and
 * should be replaced with some kind of "draft" system - but it will do for
 * now.
 */
'use strict'
let React = require('react')

let FormNewContent = React.createClass({
  render: function () {
    return (
      <div className='author-new-content well'>
        <h2>Author New Content</h2>
        <form>
          <div className='form-group'>
            <label htmlFor='inputTitle'>Title</label>
            <input type='text' className='form-control' id='inputTitle' placeholder='Title'/>
          </div>
          <div className='form-group'>
            <label htmlFor='inputLabel'>Label</label>
            <input type='text' className='form-control' id='inputLabel' placeholder='Label'/>
          </div>
          <div className='form-group'>
            <label htmlFor='inputBody'>Body</label>
            <textarea className='form-control' rows='10' id='inputBody'></textarea>
          </div>
          <button type='submit' className='btn btn-default'>Submit</button>
        </form>
      </div>
    )
  }
})

module.exports = FormNewContent
