'use strict'
let os = require('os')

let Constants = {
  DB: {
    basePath: os.tmpdir(),
    defaultName: 'datt-database'
  }
}
module.exports = Constants
