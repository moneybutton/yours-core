/* global it,describe */
var should = require('should')
var q = require('q')
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
    describe('@verifySignature', function () {
      it('should return true for a valid signature', function () {
        var hashbuf = bitcore.crypto.Hash.sha256(databuf)
        var privateKey = new bitcore.PrivateKey()
        var publicKey = privateKey.toPublicKey()
        return AsyncCrypto.sign(hashbuf, privateKey, 'big').then(function (sig) {
          return AsyncCrypto.verifySignature(hashbuf, sig, publicKey)
        }).then(function (verified) {
          should.exist(verified)
          verified.should.eql(true)
        }).catch(function (err) {
          should.fail('Should not throw an error: ' + err + '\n\n ' + err.stack)
        })
      })

      it('should return false for an invalid signature', function () {
        var hashbuf = bitcore.crypto.Hash.sha256(databuf)
        var privateKey = new bitcore.PrivateKey()

        var otherPrivateKey = new bitcore.PrivateKey()
        var otherPublicKey = otherPrivateKey.toPublicKey()

        return AsyncCrypto.sign(hashbuf, privateKey, 'big').then(function (sig) {
          return AsyncCrypto.verifySignature(hashbuf, sig, otherPublicKey)
        }).then(function (verified) {
          should.exist(verified)
          verified.should.eql(false)
        }).catch(function (err) {
          should.fail('Should not throw an error: ' + err + '\n\n ' + err.stack)
        })
      })

      it('should reject the promise if any arguments are missing, null, or undefined', function () {
        var hashbuf = bitcore.crypto.Hash.sha256(databuf)
        var privateKey = new bitcore.PrivateKey()
        var publicKey = privateKey.toPublicKey()

        return AsyncCrypto.sign(hashbuf, privateKey, 'big').then(function (sig) {
          return q.allSettled([
            AsyncCrypto.verifySignature(null, sig, publicKey),
            AsyncCrypto.verifySignature(undefined, sig, publicKey),
            AsyncCrypto.verifySignature(hashbuf, null, sig),
            AsyncCrypto.verifySignature(hashbuf, undefined, sig),
            AsyncCrypto.verifySignature(hashbuf, sig, null),
            AsyncCrypto.verifySignature(hashbuf, sig, undefined)
          ])
        }).spread(function (nullHash, undefinedHash, nullSig, undefinedSig, nullPubKey, undefinedPubKey) {
          nullHash.state.should.eql('rejected')
          undefinedHash.state.should.eql('rejected')
          nullSig.state.should.eql('rejected')
          undefinedSig.state.should.eql('rejected')
          nullPubKey.state.should.eql('rejected')
          undefinedPubKey.state.should.eql('rejected')
        })
      })
    })

  })

})
