/* global describe,it */
'use strict'
let BIP44Wallet = require('../../core/bip44-wallet')
let should = require('should')
let spawn = require('../../util/spawn')

describe('BIP44Wallet', function () {
  it('should exist', function () {
    should.exist(BIP44Wallet)
    should.exist(BIP44Wallet())
  })

  describe('#asyncFromRandom', function () {
    it('should generate a random wallet', function () {
      return spawn(function *() {
        let bip44wallet = yield BIP44Wallet().asyncFromRandom()
        should.exist(bip44wallet.mnemonic)
        should.exist(bip44wallet.masterxprv)
        should.exist(bip44wallet.masterxpub)

        let entropybuf = new Buffer(16)
        entropybuf.fill(0)
        bip44wallet = yield BIP44Wallet().asyncFromRandom(entropybuf)
        bip44wallet.mnemonic.toString().should.equal('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')
      })
    })
  })
})
