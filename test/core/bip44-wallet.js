/* global describe,it */
'use strict'
let BIP44Wallet = require('../../core/bip44-wallet')
let BIP44Account = require('../../core/bip44-account')
let should = require('should')
let asink = require('asink')

describe('BIP44Wallet', function () {
  it('should exist', function () {
    should.exist(BIP44Wallet)
    should.exist(BIP44Wallet())
  })

  describe('#asyncFromRandom', function () {
    it('should generate a random wallet', function () {
      return asink(function *() {
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

  describe('#getPrivateAccount', function () {
    it('should generate a random wallet', function () {
      return asink(function *() {
        let bip44wallet = yield BIP44Wallet().asyncFromRandom()
        let bip44account = bip44wallet.getPrivateAccount(0)
        ;(bip44account instanceof BIP44Account).should.equal(true)
        bip44account = bip44wallet.getPrivateAccount(1)
        ;(bip44account instanceof BIP44Account).should.equal(true)
      })
    })
  })
})
