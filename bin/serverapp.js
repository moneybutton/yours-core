#!/usr/bin/env node
var express = require('express')
var browserify = require('browserify')
var babelify = require('babelify')
var React = require('react')
var jsx = require('node-jsx')
var app = express()

jsx.install()

var Index = require('../views/index.jsx')

app.use('/bundle.js', function (req, res) {
  res.setHeader('content-type', 'application/javascript')
  // TODO: We shouldn't be browserifying on the fly because it is slow. Need to
  // add a build process.
  browserify({debug: true})
    .add(require.resolve('babelify/polyfill'))
    .add(require.resolve('./app.js'))
    .transform('reactify')
    .transform(babelify)
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
          __html: React.renderToString(React.createElement(Index))
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
