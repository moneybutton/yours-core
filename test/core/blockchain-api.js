/* global describe,it */
'use strict'
let BlockchainAPI = require('../../core/blockchain-api')
let asink = require('asink')
let should = require('should')

describe('BlockchainAPI', function () {
  it('should exist', function () {
    should.exist(BlockchainAPI)
    should.exist(BlockchainAPI())
  })

  describe('#asyncGetLatestBlockInfo', function () {
    it('should make a real request and get the latest block info', function () {
      return asink(function *() {
        let info = yield BlockchainAPI().asyncGetLatestBlockInfo()
        should.exist(info.idbuf)
        should.exist(info.idhex)
        should.exist(info.hashbuf)
        should.exist(info.hashhex)
        should.exist(info.height)
      })
    })
  })
})
