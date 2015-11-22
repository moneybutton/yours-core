/* global window */
'use strict'
let os = require('os')

let Constants = {
  maxsize: 30000, // maximum size of data in bytes
  timeout: 2000,
  blockchainAPIURI: process.browser ? window.location.origin + '/blockchain-api/' : 'https://insight.bitpay.com/api/',
  Network: {
    rendezvous: {
      host: 'localhost',
      port: 3031,
      path: '/'
    }
  },
  DB: {
    basePath: os.tmpdir(),
    defaultName: 'datt-database'
  },
  Msg: {
    magicnum: 0x255a484b
  }
}

module.exports = Constants
