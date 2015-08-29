/* global it,describe */
var should = require('should')
var bitcore = require('bitcore')
var AsyncCrypto = require('../lib/asynccrypto')
var Workers = require('../lib/workers')

describe('AsyncCrypto', function () {
  var databuf = new Buffer(50)
  databuf.fill(0)

  describe('AsyncCrypto', function () {
    it('should exist', function () {
      should.exist(AsyncCrypto)
      should.exist(AsyncCrypto.sha256)
      should.exist(AsyncCrypto.publicKeyFromPrivateKey)
      should.exist(AsyncCrypto.addressFromPublicKey)
      should.exist(AsyncCrypto.sign)
      var asyncCrypto = new AsyncCrypto()
      should.exist(asyncCrypto)
      should.exist(asyncCrypto.sha256)
      should.exist(asyncCrypto.publicKeyFromPrivateKey)
      should.exist(asyncCrypto.addressFromPublicKey)
      should.exist(asyncCrypto.sign)
    })

    it('should share the same default workers', function () {
      var asyncCrypto = new AsyncCrypto()
      var asyncCrypto2 = new AsyncCrypto()
      asyncCrypto2.workers.should.equal(asyncCrypto.workers)
      var workers = new Workers()
      var asyncCrypto3 = new AsyncCrypto(workers)
      asyncCrypto3.workers.should.not.equal(asyncCrypto.workers)
    })

  })

  describe('@sha256', function () {
    it('should compute the same as bitcore', function () {
      return AsyncCrypto.sha256(databuf).then(function (buf) {
        buf.compare(bitcore.crypto.Hash.sha256(databuf)).should.equal(0)
      })
    })

  })

  describe('@publicKeyFromPrivateKey', function () {
    it('should compute the same as bitcore', function () {
      var privateKey = new bitcore.PrivateKey()
      return AsyncCrypto.publicKeyFromPrivateKey(privateKey).then(function (publicKey) {
        publicKey.toString('hex').should.equal(privateKey.toPublicKey().toString('hex'))
      })
    })

  })

  describe('@addressFromPublicKey', function () {
    it('should compute the same as bitcore', function () {
      var privateKey = new bitcore.PrivateKey()
      var publicKey = privateKey.toPublicKey()
      return AsyncCrypto.addressFromPublicKey(publicKey).then(function (address) {
        address.toString().should.equal(publicKey.toAddress().toString())
      })
    })

  })

  describe('ECDSA', function () {
    describe('@sign', function () {
      it('should compute the same as bitcore', function () {
        var privateKey = new bitcore.PrivateKey()
        var hashbuf = bitcore.crypto.Hash.sha256(databuf)
        return AsyncCrypto.sign(hashbuf, privateKey, 'big').then(function (sig) {
          sig.toString().should.equal(bitcore.crypto.ECDSA.sign(hashbuf, privateKey, 'big').toString())
        })
      })

    })

  })

})
