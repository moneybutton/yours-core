/**
 * App Server
 * ==========
 *
 * This server delivers the front-end to web browsers and also runs a proxy to
 * the blockchain API.
 */
'use strict'
let express = require('express')
let path = require('path')
let requestProxy = require('express-request-proxy')
let config = require('../config')

module.exports.createAppServer = function createAppServer (port) {
  let app = express()

  // The blockchain API proxy.
  app.get('/blockchain-api/:val1/:val2/:val3', requestProxy({
    url: config.DATT_BLOCKCHAIN_API_URI + ':val1/:val2/:val2'
  }))
  app.get('/blockchain-api/:val1/:val2', requestProxy({
    url: config.DATT_BLOCKCHAIN_API_URI + ':val1/:val2'
  }))
  app.get('/blockchain-api/:val1', requestProxy({
    url: config.DATT_BLOCKCHAIN_API_URI + ':val1'
  }))
  app.post('/blockchain-api/:val1/:val2/:val3', requestProxy({
    url: config.DATT_BLOCKCHAIN_API_URI + ':val1/:val2/:val3'
  }))
  app.post('/blockchain-api/:val1/:val2', requestProxy({
    url: config.DATT_BLOCKCHAIN_API_URI + ':val1/:val2'
  }))
  app.post('/blockchain-api/:val1', requestProxy({
    url: config.DATT_BLOCKCHAIN_API_URI + ':val1'
  }))

  // The front-end is just static HTML, CSS and JS files.
  app.use(express.static(path.join(__dirname, '../build')))

  let server = app.listen(port, function () {
    let host = server.address().address
    let port = server.address().port
    console.log('View the app at http://%s:%s/', host, port)
    console.log('Run the mocha browser tests at http://%s:%s/tests.html', host, port)
  })
  return server
}
