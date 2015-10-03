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
      newUserName: ''
    }
  },
  propTypes: {
    dattcore: React.PropTypes.object,
    mnemonic: React.PropTypes.string
  },
  componentWillMount: function () {
    let dattcore = this.props.dattcore
    return dattcore.getUserName().then(userName => {
      this.setState({
        userName: userName,
        newUserName: userName
      })
    })
  },
  handleChange: function (e) {
    this.setState({
      newUserName: e.target.value
    })
  },
  handleSubmit: function () {
    let dattcore = this.props.dattcore
    return dattcore.setUserName(this.state.newUserName).then(() => {
      this.setState({
        userName: this.state.newUserName
      })
    })
  },
  render: function () {
    return (
      <div className='info-box'>
        <h2>My User</h2>
        <p>Your mnemonic: {this.props.mnemonic}</p>
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
