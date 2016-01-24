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
let asink = require('asink')

let FormNewContent = React.createClass({
  getInitialState: function () {
    return {
      inputTitle: '',
      inputLabel: '',
      inputBody: ''
    }
  },

  propTypes: {
    dattcore: React.PropTypes.object
  },

  handleTitleChange: function (el) {
    this.setState({
      inputTitle: el.target.value
    })
  },

  handleLabelChange: function (el) {
    this.setState({
      inputLabel: el.target.value
    })
  },

  handleBodyChange: function (el) {
    this.setState({
      inputBody: el.target.value
    })
  },

  handleSubmit: function (el) {
    return asink(function *() {
      el.preventDefault()
      let title = this.state.inputTitle
      let label = this.state.inputLabel
      let body = this.state.inputBody
      let dattcore = this.props.dattcore
      yield dattcore.asyncPostNewContentAuth(title, label, body)
      this.setState(this.getInitialState())
    }, this)
  },

  render: function () {
    return (
    <div className='row'>
    <div className='col-md-8 col-md-offset-2'>
      <div className='author-new-content well'>
        <h2>Author New Content</h2>
        <form>
          <div className='form-group'>
            <label htmlFor='inputTitle'>Title</label>
            <input type='text' className='form-control' id='inputTitle' placeholder='Title' onChange={this.handleTitleChange} value={this.state.inputTitle}/>
          </div>
          <div className='form-group'>
            <label htmlFor='inputLabel'>Label</label>
            <input type='text' className='form-control' id='inputLabel' placeholder='Label' onChange={this.handleLabelChange} value={this.state.inputLabel}/>
          </div>
          <div className='form-group'>
            <label htmlFor='inputBody'>Body</label>
            <textarea className='form-control' rows='5' id='inputBody' onChange={this.handleBodyChange} value={this.state.inputBody}></textarea>
          </div>
          <button type='submit' className='btn btn-default' onClick={this.handleSubmit}>Submit</button>
        </form>
      </div>
      </div>
      </div>
    )
  }
})

module.exports = FormNewContent
