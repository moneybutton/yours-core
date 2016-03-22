/* global window,self */
'use strict'
let os = require('os')

/**
 * The blockchain API URI depends on whether we are in node or a browser. In
 * node, we can simply query any URI, so it's simple. In a browser, however,
 * due to the browser security model, we can only query the domain the app was
 * loaded from. So the app must be delivered with a blockchain API proxy, and
 * we query the proxy at this domain.
 */
let blockchainAPIURI = ''
if (process.browser) {
  let win = typeof window === 'undefined' ? self : window
  blockchainAPIURI = win.location.origin + '/blockchainapi/'
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
  blockchainAPIMonitorInterval: 10000,
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
