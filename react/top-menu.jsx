'use strict'
let React = require('react')

let TopMenu = React.createClass({
  getInitialState: function () {
    return {
      totalBalanceBits: 0
    }
  },

  propTypes: {
    newClicked: React.PropTypes.func,
    configClicked: React.PropTypes.func
  },

  logoClicked: function () {
    window.location.hash = '/frontpage'
  },
  render: function () {
    return (
      <div className='row page-header'>
        <div className='col-md-4'>
          <div className='topMenu'>
            <ul className='icons'>
              <li onClick={this.props.newClicked}>
                <img src='images/icon_new.png' />
              </li>
            </ul>
          </div>
        </div>
        <div className='col-md-4 logo' onClick={this.logoClicked}>
          <img src='/logo.svg' alt='' onClick={this.logoClicked} />
        </div>
        <div className='col-md-4 topMenu'>
          <div className='row'>
            <div className='col-md-8 col-md-offset-2'>
              <div className='search_bar'>
                <form action='javascript:void(0)'>
                  <input type='text' className='search_input' placeholder='Search...' />
                </form>
              </div>
            </div>
            <div className='col-md-1 col-md-offset-1'>
              <div className='iconDiv'>
                <ul className='icons'>
                  <li>
                    <img src='images/icon_search.png' />
                  </li>
                  <li onClick={this.props.configClicked}>
                    <span aria-hidden='true' className='glyphicon glyphicon-cog'></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

module.exports = TopMenu
