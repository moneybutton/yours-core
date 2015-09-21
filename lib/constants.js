'use strict'
let os = require('os')

let Constants = {
  DB: {
    basePath: os.tmpdir()
  }
}
module.exports = Constants
