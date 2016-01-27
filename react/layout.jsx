/**
 * Layout
 * =====
 *
 * This is the main layout component which frames every page.
 */
'use strict'
let TopMenu = require('./top-menu.jsx')
let PageFront = require('./page-front.jsx')
let Content = require('./content.jsx')
let React = require('react')
let asink = require('asink')
let ConfigPanel = require('./config-panel.jsx')

let Layout = React.createClass({
  getInitialState: function () {
    return {
      dattcoreStatus: 'uninitialized',
      numActiveConnections: 0,
      view: {
        'contentList': true
      }
    }
  },

  updateStateFromHash: function () {
    var hashString = (window.location.hash && window.location.hash.length > 1 ? window.location.hash : '#/')
    var hashParts = hashString.split('/').slice(1)

    this.setState({
      route: hashParts[0],
      routeArgs: hashParts.slice(1)
    })
  },

  componentWillMount: function () {
    this.updateStateFromHash()
    window.addEventListener('hashchange', this.updateStateFromHash.bind(this))

    return asink(function *() {
      let dattcore = this.props.dattcore
      try {
        yield dattcore.asyncInitialize()
        this.setState({
          dattcoreStatus: 'initialized'
        })
        this.monitorDattCore()
      } catch (err) {
        this.setState({
          dattcoreStatus: 'error initializing: ' + err
        })
      }
      yield dattcore.asyncNetworkInitialize()
    }, this)
  },

  propTypes: {
    apptitle: React.PropTypes.string,
    dattcore: React.PropTypes.object
  },

  monitorDattCore: function () {
    let dattcore = this.props.dattcore
    dattcore.on('peers-connection', this.handlePeersConnection)
  },

  handlePeersConnection: function () {
    return asink(function *() {
      let dattcore = this.props.dattcore
      let n = yield dattcore.asyncNumActiveConnections()
      this.setState({
        numActiveConnections: n
      })
    }, this)
  },
  updateView: function (self, viewLabel, value) {
    var view = self.state.view || {}
    view[viewLabel] = value
    self.setState({'view': view})
  },
  toggleView: function (self, viewLabel) {
    var value = (self.state.view || {})[viewLabel]
    self.updateView(self, viewLabel, (value ? false : true))
  },
  newPostView: function (self) {
    self.toggleView(self, 'formNewContent')
    document.location.hash = '/frontpage'
  },
  configView: function (self) {
    self.toggleView(self, 'settings')
  },
  render: function () {
    let dattcore = this.props.dattcore
    let dattcoreStatus = this.state.dattcoreStatus
    let numActiveConnections = this.state.numActiveConnections
    let View

    switch (this.state.route) {
      case 'content':
        View = Content
        break
      default:
        View = PageFront
        break
    }

    return (
    <div className='container'>
        <TopMenu newClicked={this.newPostView.bind(this, this)} configClicked={this.configView.bind(this, this)}/>
        <div className='row'>
        <div className={(this.state.view.settings ? 'col-md-8' : '')}>
            <View dattcore={dattcore} view={this.state.view} route={this.state.route} routeArgs={this.state.routeParts} updateView={this.updateView.bind(this, this)} contentkey={this.state.routeArgs[0]} />
        </div>
        {[(this.state.view.settings ?
      (<div className='col-md-4 side-boxes'>
            <ConfigPanel dattcore={dattcore} numActiveConnections={numActiveConnections}/>
           </div>) : null)]}
        </div>

        <div className='row page-footer'>
        <div className='col-md-12'>
            <div className='version-number'>
            <p>Status of dattcore: {dattcoreStatus}</p>
            <p>Datt v{dattcore.version}</p>
            </div>
        </div>
        </div>
    </div>
    )
  }
})

module.exports = Layout
