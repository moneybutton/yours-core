'use strict'

let React = require('react')
let asink = require('asink')

let ContentHeader = require('./content-header.jsx')

let Content = React.createClass({
  getInitialState: function () {
    return {
      'content': null
    }
  },

  propTypes: {
    dattcore: React.PropTypes.object,
    contentkey: React.PropTypes.string
  },

  componentWillMount: function () {
    return this.setStateFromDattCore()
  },

  componentDidUpdate: function () {
    return this.setStateFromDattCore()
  },

  setStateFromDattCore: function () {
    return asink(function* () {
      if (!this.props.contentkey) {
        return
      }

      let dattcore = this.props.dattcore
      let DattCore = dattcore.constructor

      let contentauth = yield dattcore.corecontent.asyncGetContentAuth(this.props.contentkey)

      if (contentauth && contentauth.getContent()) {
        let key = contentauth.cachehash.toString('hex')
        let address = contentauth.address
        let addressString = yield DattCore.CryptoWorkers.asyncAddressStringFromAddress(contentauth.address)
        let content = contentauth.getContent()
        let title = content.title
        let label = content.label
        let name = content.name
        let body = content.body
        let comments = content.comments || []

        let contentObj = {key, address, addressString, title, name, label, body, comments}

        this.setState({
          'content': contentObj
        })
      }
    }, this)
  },

  render: function () {
    let content = this.state.content
    let contentkey = this.props.contentkey
    let dattcore = this.props.dattcore

    let viewjsx
    if (content === null) {
      viewjsx = (<span className='gray'>Loading content {contentkey}...</span>)
    } else {
      viewjsx = (
        <ContentHeader content={content} dattcore={dattcore} showInteractButtons={true}>
          <p className='content-body'>{content.body}</p>
      </ContentHeader>
      )
    }

    return (
    <div className='container-fluid content-container'>
        <div className='row'>
        <div className='col-md-8 col-md-offset-2'>
            {viewjsx}
        </div>
        </div>
    </div>
    )
  }
})

module.exports = Content
