/* global window */
'use strict'
let os = require('os')

let blockchainAPIURI = ''
if (process.browser) {
  blockchainAPIURI = window.location.origin + '/blockchain-api/'
} else {
  if (process.env.DATT_BLOCKCHAIN_API_URI) {
    blockchainAPIURI = process.env.DATT_BLOCKCHAIN_API_URI
  } else {
    blockchainAPIURI = 'https://insight.bitpay.com/api/'
  }
}

let Constants = {
  maxsize: 30000, // maximum size of data in bytes
  timeout: 2000,
  blockchainAPIURI: blockchainAPIURI,
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
