'use strict'
let os = require('os')

let Constants = {
  maxsize: 1000000, // maximum size of data in bytes
  DB: {
    basePath: os.tmpdir(),
    defaultName: 'datt-database'
  },
  Msg: {
    magicnum: 0x255a484b
  }
}

module.exports = Constants
