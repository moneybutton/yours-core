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
  getInitialState: function () {
    return {
      inputTitle: '',
      inputLabel: '',
      inputBody: ''
    }
  },
  propTypes: {
    dattcore: React.PropTypes.object,
    dattcore_status: React.PropTypes.string
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
    el.preventDefault()
    let title = this.state.inputTitle
    let label = this.state.inputLabel
    let body = this.state.inputBody
    let dattcore = this.props.dattcore
    return dattcore.asyncPostNewContentAuth(title, label, body).then(hashbuf => {
      this.setState(this.getInitialState())
    })
  },
  render: function () {
    return (
      <div className='author-new-content well'>
        <h2>Author New Content</h2>
        <form>
          <div className='form-group'>
            <label htmlFor='inputTitle'>Title</label>
            <input type='text' className='form-control' id='inputTitle' placeholder='Title' onChange={this.handleTitleChange}/>
          </div>
          <div className='form-group'>
            <label htmlFor='inputLabel'>Label</label>
            <input type='text' className='form-control' id='inputLabel' placeholder='Label' onChange={this.handleLabelChange}/>
          </div>
          <div className='form-group'>
            <label htmlFor='inputBody'>Body</label>
            <textarea className='form-control' rows='10' id='inputBody' onChange={this.handleBodyChange}></textarea>
          </div>
          <button type='submit' className='btn btn-default' onClick={this.handleSubmit}>Submit</button>
        </form>
      </div>
    )
  }
})

module.exports = FormNewContent
