#!/usr/bin/env node
/**
 * Basic web app to facilitate running the mocha browser tests without karma.
 */
var express = require('express')
var path = require('path')
var app = express()
var ExpressPeerServer = require('peer').ExpressPeerServer

app.use(express.static(path.join(__dirname, '../public')))
app.use(express.static(path.join(__dirname, '../node_modules')))

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Run the mocha tests at http://%s:%s/', host, port)
})

app.use('/', ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true
}))

module.exports.app = app
module.exports.server = server
