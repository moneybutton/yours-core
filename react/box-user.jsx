/**
 * Box User
 * ===========
 *
 * Box for user.
 */
'use strict'
let React = require('react')
let asink = require('asink')

let BoxUser = React.createClass({
  getInitialState: function () {
    return {
      userName: '',
      newUserName: '',
      userMnemonic: ''
    }
  },

  propTypes: {
    dattcore: React.PropTypes.object
  },

  setStateFromDattcore: function () {
    return asink(function *() {
      let dattcore = this.props.dattcore
      let userName = yield dattcore.asyncGetUserName()
      this.setState({
        userName: userName,
        newUserName: userName
      })
      let userMnemonic = yield dattcore.asyncGetUserMnemonic()
      this.setState({
        userMnemonic: userMnemonic
      })
    }, this)
  },

  componentWillMount: function () {
    return this.setStateFromDattcore()
  },

  componentWillReceiveProps: function () {
    return this.setStateFromDattcore()
  },

  handleChange: function (el) {
    this.setState({
      newUserName: el.target.value
    })
  },

  handleSubmit: function () {
    return asink(function *() {
      let dattcore = this.props.dattcore
      yield dattcore.asyncSetUserName(this.state.newUserName)
      this.setState({
        userName: this.state.newUserName
      })
    }, this)
  },

  render: function () {
    return (
      <div className='info-box'>
        <h2>My User</h2>
        <p>Your mnemonic: {this.state.userMnemonic}</p>
        <p>Your current name: {this.state.userName}</p>
        <div className='input-group'>
          <input type='text' className='form-control' value={this.state.newUserName} onChange={this.handleChange}/>
          <span className='input-group-btn'>
            <button className='btn btn-default' onClick={this.handleSubmit}>Set</button>
          </span>
        </div>
      </div>
    )
  }
})

module.exports = BoxUser
