/* global describe,it */
'use strict'
let CoreBitcoin = require('../../lib/core-bitcoin')
let should = require('should')

describe('CoreBitcoin', function () {
  it('should exist', function () {
    should.exist(CoreBitcoin)
    should.exist(CoreBitcoin())
  })

  describe('#asyncGetLatestBlockInfo', function () {
    it('should return block info', function () {
      let corebitcoin = CoreBitcoin()
      return corebitcoin.asyncGetLatestBlockInfo().then(info => {
        should.exist(info.idbuf)
        should.exist(info.idhex)
        should.exist(info.hashbuf)
        should.exist(info.hashhex)
        should.exist(info.height)
      })
    })
  })
})
