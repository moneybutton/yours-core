'use strict'
let React = require('react')
let asink = require('asink')
let Modal = require('react-bootstrap-modal')

let SetupModal = React.createClass({
  componentDidMount: function () {
    this.open()
  },

  open: function () {
    this.setState({open: true})
  },

  close: function () {
    this.setState({open: false})
  },

  onClose: function () {
    window.location.hash = '#/frontpage'
  },

  clickCreateNew: function () {
    window.location.hash = '#/setup/new'
  },

  clickRestore: function () {
    window.location.hash = '#/setup/restore'
  },

  getInitialState: function () {
    return {
      open: true,
      userName: '',
      userMnemonic: ''
    }
  },

  propTypes: {
    dattcore: React.PropTypes.object,
    routeArgs: React.PropTypes.arrayOf(React.PropTypes.string)
  },

  setStateFromDattcore: function () {
    return asink(function *() {
      let dattcore = this.props.dattcore
      let userName = yield dattcore.asyncGetUserName()
      this.setState({
        userName: userName
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

  handleSubmitNew: function () {
    let newUserName = this.refs.newUserNameInput.value

    return asink(function *() {
      this.close()
      let dattcore = this.props.dattcore
      yield dattcore.asyncSetUserSetupFlag(true)
      let userNameSynced = dattcore.asyncSetUserName(newUserName) // *intentionally* NOT yield-ing
      window.location.hash = '#/frontpage'
      yield userNameSynced
      dattcore.emit('refresh-content', null)
    }, this)
  },

  handleSubmitRestore: function () {
    /* let mnemonic = this.refs.restoreMnemonicInput.value

       return asink(function* () {
       let dattcore = this.props.dattcore
       yield dattcore.asyncSetUserFromMnemonic(mnemonic) // METHOD DOESN'T EXIST YET
       this.close()
       }, this) */
  },

  render: function () {
    let initialSetup = (
        <div className='setup-initial'>
            <div className='row vspacer05'>
                <div className='col-md-offset-3 col-md-6 text-center'>
                    <h3>Welcome!</h3>
                    <h4 className='gray'>It looks like you're new here</h4>
                </div>
            </div>
            <div className='row vspacer10'>
                <div className='col-md-offset-1 col-md-10'>
                    <button className='btn btn-default text-uppercase text-bold' onClick={this.clickCreateNew}>Create new identity</button><h4 className='gray text-inline-block'>&nbsp; or &nbsp;</h4><button className='btn btn-default text-uppercase text-bold' onClick={this.clickRestore}>Restore old identity</button>
                </div>
            </div>
            <div className='row vspacer10'></div>
        </div>
    )

    let setupNew = (
        <div className='setup-new'>
            <div className='row vspacer05'>
                <div className='col-md-offset-1 col-md-10'>
                    <h4 className='gray'>Choose a Username</h4>
                    <input type='text' className='setup-input setup-username-input' ref='newUserNameInput' defaultValue={this.state.userName}></input>
                </div>
            </div>
            <div className='row vspacer05'>
                <div className='col-md-offset-1 col-md-10'>
                    <h4 className='gray'>Your Mnemonic</h4>
                    <textarea className='setup-input setup-mnemonic' value={this.state.userMnemonic} readOnly></textarea>
                </div>
            </div>
            <div className='row vspacer05'>
                <div className='col-md-offset-1 col-md-2'>
                    <button className='btn btn-default text-uppercase text-bold' onClick={this.handleSubmitNew}>Let's go!</button>
                </div>
            </div>
            <div className='row vspacer05'></div>
        </div>
    )

    let setupRestore = (
        <div className='setup-restore'>
            <div className='row vspacer05'>
                <div className='col-md-offset-1 col-md-10'>
                    <h4 className='gray'>Your Mnemonic</h4>
                    <textarea ref='restoreMnemonicInput' className='setup-input setup-mnemonic'></textarea>
                </div>
            </div>
            <div className='row vspacer05'>
                <div className='col-md-offset-1 col-md-2'>
                    <button className='btn btn-default text-uppercase text-bold' onClick={this.handleSubmitRestore}>Restore identity</button>
                </div>
            </div>
            <div className='row vspacer05'></div>
        </div>
    )

    let setupContent

    switch (this.props.routeArgs[0]) {
      case 'restore':
        setupContent = setupRestore
        break
      case 'new':
        setupContent = setupNew
        break
      default:
        setupContent = initialSetup
    }

    return (
      <div ref='modal_container'>
        <Modal show onHide={this.onClose} container={this.refs.modal_container}>
          <Modal.Body>
          <div className='container-fluid'>
            {setupContent}
          </div>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
})

module.exports = SetupModal
