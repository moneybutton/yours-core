'use strict'
let os = require('os')

let Constants = {
  maxsize: 30000, // maximum size of data in bytes
  Network: {
    rendezvous: {
      host: 'localhost',
      port: 3030,
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
