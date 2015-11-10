/**
 * Box User
 * ===========
 *
 * Box for user.
 */
'use strict'
let React = require('react')

let BoxUser = React.createClass({
  getInitialState: function () {
    return {
      userName: '',
      newUserName: '',
      userMnemonic: ''
    }
  },

  propTypes: {
    dattcore: React.PropTypes.object,
    status: React.PropTypes.string
  },

  setStateFromDattcore: function () {
    let dattcore = this.props.dattcore
    return dattcore.asyncGetUserName().then(userName => {
      this.setState({
        userName: userName,
        newUserName: userName
      })
      return dattcore.asyncGetUserMnemonic()
    }).then(userMnemonic => {
      this.setState({
        userMnemonic: userMnemonic
      })
    })
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
    let dattcore = this.props.dattcore
    return dattcore.asyncSetUserName(this.state.newUserName).then(() => {
      this.setState({
        userName: this.state.newUserName
      })
    })
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
