/* global describe,it */
'use strict'
let CorePeers = require('../../lib/core-peers')
let should = require('should')

describe('CorePeers', function () {
  it('should exist', function () {
    let corepeers = CorePeers()
    should.exist(CorePeers)
    should.exist(CorePeers())
    should.exist(corepeers)
  })
})
