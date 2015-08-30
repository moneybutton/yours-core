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

  describe('@fromRandom', function () {
    it('should make a new walletfile', function () {
      return WalletFile.fromRandom().then(function (walletfile) {
        should.exist(walletfile)
        should.exist(walletfile.mnemonic)
        should.exist(walletfile.masterxprv)
        should.exist(walletfile.masterxpub)
      })
    })

  })

  describe('@fromSeed', function () {
    it('should derive new mnemonic, xprv, xpub', function () {
      var seedbuf = new Buffer(128 / 8)
      seedbuf.fill(0)
      return WalletFile.fromSeed(seedbuf).then(function (walletfile) {
        walletfile.mnemonic.should.equal('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')
        walletfile.masterxprv.toString().should.equal('xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu')
        walletfile.masterxpub.toString().should.equal('xpub661MyMwAqRbcFkPHucMnrGNzDwb6teAX1RbKQmqtEF8kK3Z7LZ59qafCjB9eCRLiTVG3uxBxgKvRgbubRhqSKXnGGb1aoaqLrpMBDrVxga8')
      })
    })

  })

})
