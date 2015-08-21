/* global it,describe */
var should = require('should')
var bitcore = require('bitcore')
var AsyncCrypto = require('../lib/asynccrypto')
var asyncCrypto = new AsyncCrypto()

describe('AsyncCrypto', function () {
  var databuf = new Buffer(50)
  databuf.fill(0)

  describe('AsyncCrypto', function () {

    it('should exist', function () {
      should.exist(AsyncCrypto)
      should.exist(asyncCrypto)
    })

  })

  describe('#sha256', function () {

    it('should compute the same as bitcore', function () {
      return asyncCrypto.sha256(databuf).then(function (buf) {
        buf.compare(bitcore.crypto.Hash.sha256(databuf)).should.equal(0)
      })
    })

  })

  describe('#PublicKeyFromPrivateKey', function () {

    it('should compute the same as bitcore', function () {
      var privateKey = new bitcore.PrivateKey()
      return asyncCrypto.PublicKeyFromPrivateKey(privateKey).then(function (publicKey) {
        publicKey.toString('hex').should.equal(privateKey.toPublicKey().toString('hex'))
      })
    })

  })

  describe('#AddressFromPublicKey', function () {

    it('should compute the same as bitcore', function () {
      var privateKey = new bitcore.PrivateKey()
      var publicKey = privateKey.toPublicKey()
      return asyncCrypto.AddressFromPublicKey(publicKey).then(function (address) {
        address.toString().should.equal(publicKey.toAddress().toString())
      })
    })

  })

  describe('ECDSA', function () {

    describe('#sign', function () {

      it('should compute the same as bitcore', function () {
        var privateKey = new bitcore.PrivateKey()
        var hashbuf = bitcore.crypto.Hash.sha256(databuf)
        return asyncCrypto.sign(hashbuf, privateKey, 'big').then(function (sig) {
          sig.toString().should.equal(bitcore.crypto.ECDSA.sign(hashbuf, privateKey, 'big').toString())
        })
      })

    })

  })

})
