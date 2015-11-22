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

module.exports.createAppServer = function createAppServer (port) {
  let app = express()

  // The blockchain API proxy.
  app.get('/blockchain-api/:val1/:val2', requestProxy({
    url: 'https://insight.bitpay.com/api/:val1/:val2' // TODO: support testnet; use environment variable
  }))
  app.get('/blockchain-api/:val1', requestProxy({
    url: 'https://insight.bitpay.com/api/:val1' // TODO: support testnet; use environment variable
  }))
  app.post('/blockchain-api/:val1/:val2', requestProxy({
    url: 'https://insight.bitpay.com/api/:val1/:val2' // TODO: support testnet; use environment variable
  }))
  app.post('/blockchain-api/:val1', requestProxy({
    url: 'https://insight.bitpay.com/api/:val1' // TODO: support testnet; use environment variable
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
