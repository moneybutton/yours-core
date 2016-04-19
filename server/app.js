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
let httpProxy = require('http-proxy')
let config = require('../config')

module.exports.createAppServer = function createAppServer (port) {
  let app = express()

  // The blockchain API proxy.
  let apiProxy = httpProxy.createProxyServer()
  app.all('/blockchainapi/*', (req, res) => {
    req.url = req.url.replace('/blockchainapi/', '/')
    apiProxy.web(req, res, {
      target: config.YOURS_CORE_BLOCKCHAIN_API_URI,
      changeOrigin: true
    })
  })
  apiProxy.on('error', (err, req, res) => {
    if (err) {
      res.end()
    }
  })

  // The front-end is just static HTML, CSS and JS files.
  app.use(express.static(path.join(__dirname, '../build')))

  let server = app.listen(port, () => {
    let host = server.address().address
    let port = server.address().port
    console.log('View the app at http://%s:%s/', host, port)
    console.log('Run the mocha browser tests at http://%s:%s/tests.html', host, port)
  })

  return server
}
