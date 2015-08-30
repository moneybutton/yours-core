/* global it,describe */
var should = require('should')
var q = require('q')
var WalletFile = require('../lib/walletfile')

describe('WalletFile', function () {
  describe('WalletFile', function () {
    it('should exist', function () {
      should.exist(WalletFile)
      should.exist(WalletFile())
      should.exist(new WalletFile())
    })

  })

  describe('fromRandom', function () {
    it('should make a new walletfile', function () {
      return WalletFile.fromRandom().then(function (walletfile) {
        should.exist(walletfile)
        should.exist(walletfile.mnemonic)
        should.exist(walletfile.masterxprv)
        should.exist(walletfile.masterxpub)
      })
    })

  })

})
