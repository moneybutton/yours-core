var DattNode = require('datt-node')
var React = require('react')

var dattnode // global dattnode application - the p2p/db/logic of datt

var Index = React.createClass({
  getInitialState: function () {
    return {
      status: 'uninitialized'
    }
  },
  componentDidMount: function () {
    dattnode = DattNode.create()
    dattnode.init().then(function () {
      this.setState({status: 'initialized'})
    }.bind(this))
  },
  render: function () {
    return (
      <p>status of dattnode: {this.state.status}<br/>
      name: {this.props.propname}
      </p>
    )
  }
})

module.exports = Index
