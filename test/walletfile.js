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

  describe('@deriveBIP44Xkeys', function () {
    it('should derive new xprv, xpub, address', function () {
      var seedbuf = new Buffer(128 / 8)
      seedbuf.fill(0)
      return WalletFile.fromSeed(seedbuf).then(function (walletfile) {
        return walletfile.deriveBIP44Xkeys(0, 0, 0)
      }).then(function (obj) {
        obj.xprv.toString().should.equal('xprvA2cWYEXRrpaYZmR4Mat3aHw7ARSGFAtb5LQNfSuyQCCGVJXRNWA3zkkHZcBM4voi9TBrb9WaC65HGv5e8gZgfnjzH71WofaXT3haLw8LYqQ')
        obj.xpub.toString().should.equal('xpub6Fbrwk4KhC8qnFVXTcR3wRsqiTGkedcSSZKyTqKaxXjFN6rZv3UJYZ4mQtjNYY3gCa181iCHSBWyWst2PFiXBKgLpFVSdcyLbHyAahin8pd')
        obj.address.toString().should.equal('1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA')
      })
    })

  })

})
