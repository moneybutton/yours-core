/* global it,describe,before */
var Content = require('../lib/content')
var should = require('should')

var User = require('../lib/user')

var bitcore = require('bitcore')

var q = require('q')

var AsyncCrypto = require('../lib/asynccrypto')

describe('Content', function () {
  var content
  var testuser
  var post_time
  var post_height
  var data = 'test data'
  var asyncCrypto

  function createTestContent () {
    return Content.fromDataAndUser(data, testuser, post_time, post_height)
  }

  before(function (done) {
    testuser = new User('username', 'password')
    post_time = new Date('2015-08-21T09:58:19.733Z')
    post_height = 300000
    asyncCrypto = new AsyncCrypto()
    testuser.init().then(function () {
      createTestContent().then(function (newcontent) {
        content = newcontent
        done()
      })
    })
  })

  describe('Content', function () {
    it('should exist test content', function () {
      should.exist(content)
    })

  })

  describe('@serialize', function () {
    it('should serialize this known content', function () {
      Content.serialize(content).should.equal('{"data":"test data","owner_username":"username","owner_pubkey":"02af59b2cc4ebe9cc796f8076b095efaaed11f4f249805d3db18459f15be04de4f","owner_address":"19aM8TSmimwBsH9uVbS6SXigqM42fEzGtY","post_time":"2015-08-21T09:58:19.733Z","post_height":300000,"signature":"30440220529021857f03063b1ef4b6ea6599c99363b97f1a4dbd0f8c9f4fce5c0c236cf20220074c170c029183b098de1b088e22f9f6399ed769cd388f84a02b87f28ad18b80"}')

    })
  })

  describe('#getOwnerAddress', function () {
    it('should return the address of the owner of the content', function () {
      content.getOwnerAddress().should.eql(testuser.getAddress())
    })

    it('should return undefined if the owning user/address/pubkey has not been set', function () {
      var testcontent = new Content('hello world')
      should.exist(testcontent)
      testcontent.init().then(function () {
        should.not.exist(testcontent.getOwnerAddress())
      })
    })
  })

  describe('#setOwnerAddress', function () {
    it('should set the owner address from a string in absence of owner public key', function () {
      var testcontent = new Content('hello world')
      testcontent.init().then(function () {
        should.not.exist(testcontent.getOwnerAddress())
        var user_address = testuser.getAddress()
        ;(function () {
          testcontent.setOwnerAddress(user_address)
        }).should.not.throw()

        testcontent.getOwnerAddress().should.eql(user_address)
      })
    })

    it('should set the owner address from a string when compatible owner public key is present', function () {
      var testcontent = new Content('hello world')
      testcontent.init().then(function () {
        testcontent.setOwnerPubKey(testuser.getPubKey())
        testcontent.getOwnerPubKey().should.eql(testuser.getPubKey())

        ;(function () {
          testcontent.setOwnerAddress(testuser.getAddress())
        }).should.not.throw()

        testcontent.getOwnerAddress().should.eql(testuser.getAddress())
      })
    })

    it('should THROW AN ERROR if one attempts to set owner address from a string when incompatible owner public key is present', function () {
      var testcontent = new Content('hello world')
      var otheruser = User.randomTestUser()
      q.all([testcontent.init(), otheruser.init()]).then(function () {
        testuser.getAddress().should.not.eql(otheruser.getAddress())

        testcontent.setOwnerPubKey(otheruser.getPubKey())
        testcontent.getOwnerPubKey().should.eql(otheruser.getPubKey())

        ;(function () {
          testcontent.setOwnerAddress(testuser.getAddress())
        }).should.throw()
      })
    })

    it('should THROW AN ERROR if one provides an invalid bitcoin address object', function () {
      var testcontent = new Content('hello world')
      testcontent.init().then(function () {
        should.not.exist(testcontent.getOwnerAddress())

        ;(function () {
          testcontent.setOwnerAddress({'not': true, 'an': true, 'address': true})
        }).should.throw()

        should.not.exist(testcontent.getOwnerAddress())
      })
    })

    it('should THROW AN ERROR if one provides an invalid bitcoin address string', function () {
      var testcontent = new Content('hello world')
      testcontent.init().then(function () {
        should.not.exist(testcontent.getOwnerAddress())

        ;(function () {
          testcontent.setOwnerAddress('1RlyInvalidAddress')
        }).should.throw()

        should.not.exist(testcontent.getOwnerAddress())
      })
    })
  })

  describe('#getOwnerPubKey', function () {
    it('should return the public key of the owner of the content', function (done) {
      createTestContent().then(function (newContent) {
        newContent.getOwnerPubKey().should.equal(testuser.getPubKey())
        done()
      })
    })

    it('should return undefined if no owner or no public key has been provided', function (done) {
      var newContent = new Content(data)
      newContent.init().then(function () {
        should.not.exist(newContent.getOwnerPubKey())
        done()
      })
    })
  })

  describe('#setOwnerPubKey', function () {
    it('should set the public key of the owner of the content', function (done) {
      var newContent = new Content(data)
      var newUser = new User('different_user', 'different_password')

      q.all([newUser.init(), newContent.init()]).then(function () {
        should.not.exist(newContent.getOwnerPubKey())
        console.log(JSON.stringify(newUser, null, 4))
        should.exist(newUser.getPubKey())
        newContent.setOwnerPubKey(newUser.getPubKey()).then(function () {
          newContent.getOwnerPubKey().should.equal(newUser.getPubKey())
          done()
        })
      }).catch(function (err) {
        console.error('#setOwnerPubKey: failed to initialize content and user objects prior to test:')
        console.error(err)
        console.error(err.stack)
        should.fail(err)
        done()
      })
    })

    it('should allow a public key which is compatible with an already set owner address to be set', function (done) {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress())
      newContent.init().then(function () {
        should.not.exist(newContent.getOwnerPubKey())
        newContent.setOwnerPubKey(testuser.getPubKey()).then(function () {
          newContent.getOwnerPubKey().should.equal(testuser.getPubKey())
          done()
        })
      })
    })

    it('should throw an Error if setting a public key which is *incompatible* with an already set owner address is attempted', function (done) {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress())
      var otherUser = new User('other_user', 'other_password')

      q.all([newContent.init(), otherUser.init()]).then(function () {
        should.not.exist(newContent.getOwnerPubKey())
        should.exist(newContent.getOwnerAddress())

        ;(newContent.getOwnerAddress()).should.not.equal(otherUser.getAddress())

        newContent.setOwnerPubKey(otherUser.getPubKey()).then(function (pubkey) {
          should.not.exist(pubkey)
          should.fail('#setOwnerPubKey should fail if public key is incompatible!')
        }).catch(function (err) {
          should.not.exist(newContent.getOwnerPubKey())
          done()
        })
      })
    })

    it('should also set the owner address if it has not already been set, from the new public key', function (done) {
      var newContent = new Content(data)
      newContent.init().then(function () {
        should.not.exist(newContent.getOwnerPubKey())
        should.not.exist(newContent.getOwnerAddress())

        newContent.setOwnerPubKey(testuser.getPubKey()).then(function () {
          newContent.getOwnerPubKey().should.eql(testuser.getPubKey())
          newContent.getOwnerAddress().should.eql(testuser.getAddress())
          done()
        }).catch(function (err) {
          should.not.exist(err)
          should.fail('Should not throw this error: ' + err)
        })
      })
    })

    it('should THROW AN ERROR if one provides an invalid bitcoin pub key string', function (done) {
      var testcontent = new Content('hello world')
      testcontent.init().then(function () {
        should.not.exist(testcontent.getOwnerPubKey())

        testcontent.setOwnerPubKey('not a pub key, man').then(function () {
          should.fail('#setOwnerPubKey - should fail with invalid bitcoin pub key string')
        }).catch(function (err) {
          should.exist(err)
          should.not.exist(testcontent.getOwnerPubKey())
          done()
        })
      })

    })

    it('should THROW AN ERROR if one provides an invalid bitcoin pub key object', function (done) {
      var testcontent = new Content('hello world')
      testcontent.init().then(function () {
        should.not.exist(testcontent.getOwnerPubKey())

        testcontent.setOwnerPubKey({'not': true, 'a': true, 'pubkey': true}).then(function () {
          should.fail('#setOwnerPubKey should fail with invalid bitcoin pub key object')
        }).catch(function (err) {
          should.exist(err)
          should.not.exist(testcontent.getOwnerPubKey())
          done()
        })

      })
    })

  })

  describe('@getSignature', function () {
    it('should return the signature in hex-string form', function () {
      content.getSignature().should.eql(content.signature.toString())
    })
  })

  describe('@setSignature', function () {
    it('should set the signature from a hex-string signature', function (done) {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress(), post_time, post_height)
      newContent.init().then(function () {
        testuser.sign(data).then(function (signature) {
          var signatureStr = signature.toString()
          should.not.exist(newContent.getSignature())

          newContent.setSignature(signatureStr).then(function () {
            newContent.getSignature().should.eql(signatureStr)
            done()
          }).catch(function (err) {
            should.fail(err)
          })
        })
      })
    })

    it('should THROW AN ERROR if an invalid signature string is provided', function (done) {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress(), post_time, post_height)
      newContent.init().then(function () {
        should.not.exist(newContent.getSignature())

        newContent.setSignature('nope not a signature')
          .then(function () {
            should.fail('should throw an error if an invalid signature string is provided')
          })
          .catch(function (err) {
            should.exist(err)
            should.not.exist(newContent.getSignature())
            done()
          })
      })
    })

    it('should set the signature from a signature object', function (done) {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress(), post_time, post_height)
      newContent.init().then(function () {
        testuser.sign(data).then(function (signature) {
          var signatureStr = signature.toString()
          should.not.exist(newContent.getSignature())

          newContent.setSignature(signature).then(function () {
            newContent.getSignature().should.eql(signatureStr)
            done()
          }).catch(function (err) {
            should.fail(err)
          })
        })
      })
    })

    it('should THROW AN ERROR if an invalid signature object is provided', function (done) {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress(), post_time, post_height)
      newContent.init().then(function () {
        should.not.exist(newContent.getSignature())

        newContent.setSignature({'not': true, 'a': true, 'signature': true})
          .then(function () {
            should.fail('should throw an error with invalid signature')
          })
          .catch(function (err) {
            should.exist(err)
            should.not.exist(newContent.getSignature())
            done()
          })
      })
    })

    it('should be able to set the signature when the associated public key is set on the content', function (done) {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress(), post_time, post_height, testuser.getPubKey())
      newContent.init().then(function () {
        testuser.sign(data).then(function (signature) {
          var signatureStr = signature.toString()
          should.not.exist(newContent.getSignature())

          newContent.setSignature(signatureStr)
            .then(function () {
              newContent.getSignature().should.eql(signatureStr)
              done()
            })
            .catch(function (err) {
              should.fail(err)
            })
        })
      })
    })

    it('should THROW AN ERROR if one attempts to set a signature NOT compatible with public key associated with the content instance', function (done) {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress(), post_time, post_height, testuser.getPubKey())
      var otherUser = new User('adiffuser', 'adiffpassword')

      q.all([otherUser.init(), newContent.init()]).then(function () {
        otherUser.sign(data).then(function (otherSignature) {
          var otherSignatureStr = otherSignature.toString()

          should.not.exist(newContent.getSignature())

          newContent.setSignature(otherSignatureStr)
            .then(function () {
              should.fail('should throw an error since signature is not compatible with public key')
            })
            .catch(function (err) {
              should.exist(err)
              should.not.exist(newContent.getSignature())
              done()
            })
        })
      })

    })
  })

  describe('#getData', function () {
    it('should return the data associated with a content instance, as a string', function () {
      should.exist(content)
      should.exist(content.data)
      content.getData().should.eql(content.data)
      content.getData().should.eql(data)
      content.getData().should.be.a.String()
    })
  })

  describe('#getDataBuffer', function () {
    it('should return a Buffer containing the data utf8-encoded', function () {
      should.exist(content.getData())
      content.getDataBuffer().should.eql(new Buffer(content.getData(), 'utf8'))
    })
  })

  describe('#getHash / #getHashBuffer', function () {
    it('should return a Buffer containing a sha256 hash of the content and owner metadata (see #getBufferToHash)', function (done) {
      should.exist(content)
      should.exist(content.getData())
      content.getHash().should.eql(content.getHashBuffer())
      asyncCrypto.sha256(content.getBufferToHash()).then(function (hashcheck) {
        content.getHash().should.eql(hashcheck)
        done()
      })
    })
    it('should return an expected sha256 hash value / format', function () {
      content.getHash().toString('hex').should.eql('cc207f0005abad56ce4a3f460f465a59c49bdc68bb6313b4182a9928347f35e1')
    })
  })

  describe('#getHashHex', function () {
    it('should return a String containing a sha256 hash in hex', function () {
      content.getHashHex().should.eql('cc207f0005abad56ce4a3f460f465a59c49bdc68bb6313b4182a9928347f35e1')
      content.getHashHex().should.eql(content.getHash().toString('hex'))
    })
  })

  describe('@fromDataAndUser', function () {
    it('should create a new content instance', function (done) {
      var newUser = new User('auser', 'apassword')
      newUser.init()

      var data = 'test data ftw'
      Content.fromDataAndUser(data, newUser).then(function (newContent) {
        should.exist(newContent)
        ;(newContent instanceof Content).should.be.ok()
        ;(newContent.constructor.name === 'Content').should.be.ok()
        done()
      })
    })
    it('should return a content instance owned by the user provided', function (done) {
      var newUser = new User('auser', 'apassword')
      newUser.init()

      var data = 'test data ftw'

      Content.fromDataAndUser(data, newUser).then(function (newContent) {
        newContent.getOwnerUsername() === newUser.getUsername()
        newContent.getOwnerAddress() === newUser.getAddress()
        newContent.getOwnerPubKey() === newUser.getPubKey()
        done()
      })

    })
    it('should return a content instance containing the data provided', function (done) {
      var newUser = new User('auser', 'apassword')
      newUser.init()

      var data = 'test data ftw'
      Content.fromDataAndUser(data, newUser).then(function (newContent) {
        newContent.getData() === data
        done()
      })
    })

    it('should return a content instance with a valid signature for the data and user provided', function (done) {
      var newUser = new User('auser', 'apassword')
      newUser.init()

      var data = 'test data ftw'
      Content.fromDataAndUser(data, newUser).then(function (newContent) {
        newUser.sign(data).then(function (sig) {
          var expectedSigStr = sig.toString()
          newContent.getSignature().should.eql(expectedSigStr)
          done()
        })
      })
    })

    it('should accept an optional 3rd argument, post_time which sets post_time', function (done) {
      var newUser = new User('auser', 'apassword')
      newUser.init()
      var data = 'test data ftw'
      var pt = new Date()
      Content.fromDataAndUser(data, newUser, pt).then(function (nc2) {
        nc2.getPostTime() === pt.toString()
        done()
      })
    })

    it('should accept an optional 4th argument, post_height which sets post_height', function (done) {
      var newUser = new User('auser', 'apassword')
      newUser.init()
      var data = 'test data ftw'
      var pt = new Date()
      var ph = 305000
      Content.fromDataAndUser(data, newUser, pt, ph).then(function (nc3) {
        nc3.getPostHeight() === ph
        done()
      })
    })
  })

  describe('@verifySignature', function () {
    it('should return a boolean indicating whether a (data, ECDSA signature, ECDSA public key) tuple is consistent -- whether given signature was generated for given data by given pub key', function (done) {
      var randomTestUser = User.randomTestUser()

      randomTestUser.init().then(function () {
        var p_matchedSigAndKey = Content.verifySignature(data, testuser.sign(data), testuser.getPubKey())
        var p_mismatchedSigAndKey = Content.verifySignature(data, randomTestUser.sign(data), testuser.getPubKey())
        var p_sigAndMismatchedKey = Content.verifySignature(data, testuser.sign(data), User.randomTestUser().getPubKey())
        var p_mismatchedDataForMatchedSigAndKey = Content.verifySignature('other data!', testuser.sign(data), testuser.getPubKey())

        q.all([p_matchedSigAndKey, p_sigAndMismatchedKey, p_mismatchedSigAndKey, p_mismatchedDataForMatchedSigAndKey]).spread(function (matchedSigAndKey, sigAndMismatchedKey, mismatchedSigAndKey, mismatchedDataForMatchedSigAndKey) {
          matchedSigAndKey.should.eql(true)
          sigAndMismatchedKey.should.eql(false)
          mismatchedSigAndKey.should.eql(false)
          mismatchedDataForMatchedSigAndKey.should.eql(false)
          done()
        }).catch(function (err) {
          should.fail(err)
        })
      })

    })

    it('should THROW AN ERROR if no arguments are supplied', function (done) {
      q.allSettled([
        Content.verifySignature(),
        Content.verifySignature(null, testuser.sign(data), testuser.getPubKey()),
        Content.verifySignature(data, undefined, testuser.getPubKey()),
        Content.verifySignature(data, testuser.sign(data), null)
      ]).spread(function (noArgs, missingData, missingSignature, missingPubKey) {
        noArgs.state.should.eql('rejected')
        missingData.state.should.eql('rejected')
        missingSignature.state.should.eql('rejected')
        missingPubKey.state.should.eql('rejected')
        done()
      })
    })

    it('should THROW AN ERROR if any argument is an IMPROPER TYPE OR INVALID', function (done) {
      q.allSettled([
        Content.verifySignature(data, 'not a signature', testuser.getPubKey()),
        Content.verifySignature(data, {'not': true, 'a': true, 'signature': true}, testuser.getPubKey()),
        Content.verifySignature(data, testuser.sign(data), 'not a public key'),
        Content.verifySignature(data, testuser.sign(data), {'not': true, 'a': true, 'public': true, 'key': true}),
        Content.verifySignature({'not': true, 'normal': true, 'data': true}, testuser.sign(data), testuser.getPubKey())
      ]).spread(function (invalidSignatureString, invalidSignatureObject, invalidPubKeyString, invalidPubKeyObject, invalidDataObject) {
        invalidSignatureString.state.should.eql('rejected')
        invalidSignatureObject.state.should.eql('rejected')
        invalidPubKeyString.state.should.eql('rejected')
        invalidPubKeyObject.state.should.eql('rejected')
        invalidDataObject.state.should.eql('rejected')
        done()
      })
    })
  })
})
