let React = require('react')

let SetupModal = React.createClass({
  componentDidMount: function () {
      $('div.modal.setup-modal').modal()
      $('div.modal.setup-modal').on('hide.bs.modal', function () {
          window.location.hash = '#/frontpage'
      })
  },
  render: function () {
    return (

    <div className='modal fade in setup-modal' tabIndex='-1' role='dialog'>
                    <div className='modal-dialog'>
                        <div className='modal-content'>
                            <div className='modal-body'>
                                <div className='container-fluid'>
                                    <div className='row vspacer05'>
                                        <div className='col-md-offset-3 col-md-6 text-center'>
                                            <h3>Welcome!</h3>
                                            <h4 className='gray'>It looks like you're new here</h4>
                                        </div>
                                    </div>
                                    <div className='row vspacer10'>
                                        <div className='col-md-offset-1 col-md-10'>
                                            <button className='btn btn-default text-uppercase text-bold'>Create new identity</button><h4 className='gray text-inline-block'>&nbsp; or &nbsp;</h4><button className='btn btn-default text-uppercase text-bold'>Restore old identity</button>
                                        </div>
                                    </div>
                                    <div className='row vspacer10'></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    )
  }
})

module.exports = SetupModal
