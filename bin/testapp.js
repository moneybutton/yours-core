#!/usr/bin/env node
/**
 * Basic web app to facilitate running the mocha browser tests without karma.
 */
'use strict'
let express = require('express')
let path = require('path')
let app = express()
let ExpressPeerServer = require('peer').ExpressPeerServer

app.use(express.static(path.join(__dirname, '../build')))

let server = app.listen(3030, function () {
  let host = server.address().address
  let port = server.address().port
  console.log('bin/testapp.js')
  console.log('Note that you can run "npm run serve" to run a browserSync server')
  console.log('View the app at http://%s:%s/', host, port)
  console.log('Run the mocha browser tests at http://%s:%s/tests.html', host, port)
})

app.use('/', ExpressPeerServer(server, {debug: true}))

module.exports.app = app
module.exports.server = server
