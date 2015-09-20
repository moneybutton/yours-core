var React = require('react')

var StatusBox = React.createClass({
  getInitialState: function () {
    return {
      status: 'uninitialized'
    }
  },
  componentDidMount: function () {
    // TODO: Actually initialized dattnode
    setTimeout(function () {
      this.setState({status: 'initialized'})
    }.bind(this), 1000)
  },
  render: function () {
    return (
      <p>(fake) status of dattnode: {this.state.status}<br/>
      name: {this.props.propname}
      </p>
    )
  }
})

module.exports = StatusBox
