/**
 * An instance of dattcore to use for the front-end tests, that all share the
 * same database connection and p2p connections.
 */
'use strict'
let DattCore = require('../../core')
let config = {
  dbName: 'datt-test-react'
}
module.exports = DattCore.create(config)
