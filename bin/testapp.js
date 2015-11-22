#!/usr/bin/env node
/**
 * Basic server for loading the app or running the mocha browser tests.
 */
'use strict'
let ExpressPeerServer = require('peer').ExpressPeerServer
let express = require('express')
let path = require('path')
let requestProxy = require('express-request-proxy')

function createRendezvousServer (port) {
  let app = express()
  let server = app.listen(port, function () {
    let host = server.address().address
    let port = server.address().port
    console.log('View the rendezvous server at http://%s:%s/', host, port)
  })
  app.use('/', ExpressPeerServer(server, {debug: true, allow_discovery: true}))
  return server
}

function createAppServer (port) {
  let app = express()
  app.get('/blockchain-api/:anything', requestProxy({
    url: 'https://insight.bitpay.com/api/:anything' // TODO: support testnet; use environment variable
  }))
  app.post('/blockchain-api/:anything', requestProxy({
    url: 'https://insight.bitpay.com/api/:anything' // TODO: support testnet; use environment variable
  }))
  app.use(express.static(path.join(__dirname, '../build')))
  let server = app.listen(port, function () {
    let host = server.address().address
    let port = server.address().port
    console.log('View the app at http://%s:%s/', host, port)
    console.log('Run the mocha browser tests at http://%s:%s/tests.html', host, port)
  })
  return server
}

module.exports.createRendezvousServer = createRendezvousServer
module.exports.createAppServer = createAppServer

if (!module.parent) {
  createRendezvousServer(3031)
  createAppServer(3030)
}
