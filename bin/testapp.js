#!/usr/bin/env node
/**
 * Basic web app to facilitate running the mocha browser tests without karma.
 */
var express = require('express')
var path = require('path')
var app = express()

app.use(express.static(path.join(__dirname, '../build')))
app.use(express.static(path.join(__dirname, '../node_modules')))

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Note that you can run "npm run serve" to run a browserSync server')
  console.log('View the app at http://%s:%s/', host, port)
  console.log('Run the mocha browser tests at http://%s:%s/tests.html', host, port)
})

module.exports.app = app
module.exports.server = server
