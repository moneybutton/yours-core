var express = require('express')
var browserify = require('browserify')
var React = require('react')
var jsx = require('node-jsx')
var app = express()

jsx.install()

var StatusBox = require('../views/index.jsx')

app.use('/bundle.js', function (req, res) {
  res.setHeader('content-type', 'application/javascript')
  // TODO: We shouldn't be browserifying on the fly because it is slow. Need to
  // add a build process.
  browserify(__dirname + '/app.js', {
    debug: true
  })
    .transform('reactify')
    .bundle()
    .pipe(res)
})

app.use('/', function (req, res) {
  res.setHeader('Content-Type', 'text/html')
  res.end(React.renderToStaticMarkup(
    React.DOM.body(
      null,
      React.DOM.div({
        id: 'container',
        dangerouslySetInnerHTML: {
          __html: React.renderToString(React.createElement(StatusBox))
        }
      }),
      React.DOM.script({
        src: '/bundle.js'
      })
    )
  ))
})

var server = app.listen(3000, function () {
  var addr = server.address()
  console.log('Listening @ http://%s:%d', addr.address, addr.port)
})
