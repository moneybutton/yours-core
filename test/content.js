/* global it,describe,before */
var Content = require('../lib/content')
var should = require('should')

var User = require('../lib/user')

var bitcore = require('bitcore')

describe('Content', function () {
  var content
  var testuser
  var post_time
  var post_height
  var data

  function createTestContent () {
    return Content.fromDataAndUser(data, testuser, post_time, post_height)
  }

  before(function () {
    testuser = new User('username', 'password')
    post_time = new Date('2015-08-21T09:58:19.733Z')
    post_height = Math.round(300000)
    data = 'test data'
    content = createTestContent()
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
      should.not.exist(testcontent.getOwnerAddress())
    })
  })

  describe('#setOwnerAddress', function () {
    it('should set the owner address from a string in absence of owner public key', function () {
      var testcontent = new Content('hello world')

      should.not.exist(testcontent.getOwnerAddress())

      ;(function () {
        testcontent.setOwnerAddress(testuser.getAddress())
      }).should.not.throw()

      testcontent.getOwnerAddress().should.eql(testuser.getAddress())
    })

    it('should set the owner address from a string when compatible owner public key is present', function () {
      var testcontent = new Content('hello world')
      testcontent.setOwnerPubKey(testuser.getPubKey())

      testcontent.getOwnerPubKey().should.eql(testuser.getPubKey())

      ;(function () {
        testcontent.setOwnerAddress(testuser.getAddress())
      }).should.not.throw()

      testcontent.getOwnerAddress().should.eql(testuser.getAddress())
    })

    it('should THROW AN ERROR if one attempts to set owner address from a string when incompatible owner public key is present', function () {
      var testcontent = new Content('hello world')
      var otheruser = User.randomTestUser()

      testuser.getAddress().should.not.eql(otheruser.getAddress())

      testcontent.setOwnerPubKey(otheruser.getPubKey())
      testcontent.getOwnerPubKey().should.eql(otheruser.getPubKey())

      ;(function () {
        testcontent.setOwnerAddress(testuser.getAddress())
      }).should.throw()

    })

    it('should THROW AN ERROR if one provides an invalid bitcoin address object', function () {
      var testcontent = new Content('hello world')

      should.not.exist(testcontent.getOwnerAddress())

      ;(function () {
        testcontent.setOwnerAddress({'not': true, 'an': true, 'address': true})
      }).should.throw()

      should.not.exist(testcontent.getOwnerAddress())
    })

    it('should THROW AN ERROR if one provides an invalid bitcoin address string', function () {
      var testcontent = new Content('hello world')

      should.not.exist(testcontent.getOwnerAddress())

      ;(function () {
        testcontent.setOwnerAddress('1RlyInvalidAddress')
      }).should.throw()

      should.not.exist(testcontent.getOwnerAddress())
    })
  })

  describe('#getOwnerPubKey', function () {
    it('should return the public key of the owner of the content', function () {
      var newContent = createTestContent()
      newContent.getOwnerPubKey().should.equal(testuser.getPubKey())
    })
    it('should return undefined if no owner or no public key has been provided', function () {
      var newContent = new Content(data)
      should.not.exist(newContent.getOwnerPubKey())
    })
  })

  describe('#setOwnerPubKey', function () {
    it('should set the public key of the owner of the content', function () {
      var newContent = new Content(data)

      var newUser = new User('different_user', 'different_password')
      should.not.exist(newContent.getOwnerPubKey())
      newContent.setOwnerPubKey(newUser.getPubKey())
      newContent.getOwnerPubKey().should.equal(newUser.getPubKey())
    })

    it('should allow a public key which is compatible with an already set owner address to be set', function () {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress())
      should.not.exist(newContent.getOwnerPubKey())
      newContent.setOwnerPubKey(testuser.getPubKey())
      newContent.getOwnerPubKey().should.equal(testuser.getPubKey())
    })

    it('should throw an Error if setting a public key which is *incompatible* with an already set owner address is attempted', function () {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress())
      var otherUser = new User('other_user', 'other_password')

      should.not.exist(newContent.getOwnerPubKey())
      should.exist(newContent.getOwnerAddress())
      ;(newContent.getOwnerAddress()).should.not.equal(otherUser.getAddress())

      ;(function () {
        newContent.setOwnerPubKey(otherUser.getPubKey())
      }).should.throw()

      should.not.exist(newContent.getOwnerPubKey())
    })

    it('should also set the owner address if it has not already been set, from the new public key', function () {
      var newContent = new Content(data)

      should.not.exist(newContent.getOwnerPubKey())
      should.not.exist(newContent.getOwnerAddress())

      ;(function () {
        newContent.setOwnerPubKey(testuser.getPubKey())
      }).should.not.throw()

      newContent.getOwnerPubKey().should.eql(testuser.getPubKey())
      newContent.getOwnerAddress().should.eql(testuser.getAddress())
    })

    it('should THROW AN ERROR if one provides an invalid bitcoin pub key string', function () {
      var testcontent = new Content('hello world')

      should.not.exist(testcontent.getOwnerPubKey())

      ;(function () {
        testcontent.setOwnerPubKey('not a pub key, man')
      }).should.throw()

      should.not.exist(testcontent.getOwnerPubKey())

    })

    it('should THROW AN ERROR if one provides an invalid bitcoin pub key object', function () {
      var testcontent = new Content('hello world')

      should.not.exist(testcontent.getOwnerPubKey())

      ;(function () {
        testcontent.setOwnerPubKey({'not': true, 'a': true, 'pubkey': true})
      }).should.throw()

      should.not.exist(testcontent.getOwnerPubKey())
    })

  })

  describe('@getSignature', function () {
    it('should return the signature in hex-string form', function () {
      content.getSignature().should.eql(content.signature.toString())
    })
  })

  describe('@setSignature', function () {
    it('should set the signature from a hex-string signature', function () {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress(), post_time, post_height)
      var signature = testuser.sign(data)
      var signatureStr = signature.toString()
      should.not.exist(newContent.getSignature())

      ;(function () {
        newContent.setSignature(signatureStr)
      }).should.not.throw()

      newContent.getSignature().should.eql(signatureStr)
    })

    it('should THROW AN ERROR if an invalid signature string is provided', function () {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress(), post_time, post_height)

      should.not.exist(newContent.getSignature())

      ;(function () {
        newContent.setSignature('nope not a signature')
      }).should.throw()

      should.not.exist(newContent.getSignature())
    })

    it('should set the signature from a signature object', function () {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress(), post_time, post_height)
      var signature = testuser.sign(data)
      var signatureStr = signature.toString()
      should.not.exist(newContent.getSignature())

      ;(function () {
        newContent.setSignature(signature)
      }).should.not.throw()

      newContent.getSignature().should.eql(signatureStr)
    })

    it('should THROW AN ERROR if an invalid signature object is provided', function () {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress(), post_time, post_height)
      should.not.exist(newContent.getSignature())

      ;(function () {
        newContent.setSignature({'not': true, 'a': true, 'signature': true})
      }).should.throw()

      should.not.exist(newContent.getSignature())
    })

    it('should be able to set the signature when the associated public key is set on the content', function () {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress(), post_time, post_height, testuser.getPubKey())
      var signature = testuser.sign(data)
      var signatureStr = signature.toString()
      should.not.exist(newContent.getSignature())

      ;(function () {
        newContent.setSignature(signatureStr)
      }).should.not.throw()

      newContent.getSignature().should.eql(signatureStr)
    })

    it('should THROW AN ERROR if one attempts to set a signature NOT compatible with public key associated with the content instance', function () {
      var newContent = new Content(data, testuser.getUsername(), testuser.getAddress(), post_time, post_height, testuser.getPubKey())
      var otherUser = new User('adiffuser', 'adiffpassword')
      var otherSignatureStr = otherUser.sign(data).toString()

      should.not.exist(newContent.getSignature())

      ;(function () {
        newContent.setSignature(otherSignatureStr)
      }).should.throw()

      should.not.exist(newContent.getSignature())
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
    it('should return a Buffer containing a sha256 hash of the content and owner metadata (see #getBufferToHash)', function () {
      should.exist(content)
      should.exist(content.getData())
      content.getHash().should.eql(content.getHashBuffer())
      content.getHash().should.eql(bitcore.crypto.Hash.sha256(content.getBufferToHash()))
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
    it('should create a new content instance', function () {
      var newUser = new User('auser', 'apassword')
      var data = 'test data ftw'
      var newContent = Content.fromDataAndUser(data, newUser)
      should.exist(newContent)
      ;(newContent instanceof Content).should.be.ok()
      ;(newContent.constructor.name === 'Content').should.be.ok()
    })
    it('should return a content instance owned by the user provided', function () {
      var newUser = new User('auser', 'apassword')
      var data = 'test data ftw'
      var newContent = Content.fromDataAndUser(data, newUser)
      newContent.getOwnerUsername() === newUser.getUsername()
      newContent.getOwnerAddress() === newUser.getAddress()
      newContent.getOwnerPubKey() === newUser.getPubKey()
    })
    it('should return a content instance containing the data provided', function () {
      var newUser = new User('auser', 'apassword')
      var data = 'test data ftw'
      var newContent = Content.fromDataAndUser(data, newUser)
      newContent.getData() === data
    })

    it('should return a content instance with a valid signature for the data and user provided', function () {
      var newUser = new User('auser', 'apassword')
      var data = 'test data ftw'
      var newContent = Content.fromDataAndUser(data, newUser)
      var expectedSigStr = newUser.sign(data).toString()
      newContent.getSignature().should.eql(expectedSigStr)
    })

    it('should accept an optional 3rd argument, post_time which sets post_time', function () {
      var newUser = new User('auser', 'apassword')
      var data = 'test data ftw'
      var pt = new Date()
      var nc2 = Content.fromDataAndUser(data, newUser, pt)
      nc2.getPostTime() === pt.toString()
    })

    it('should accept an optional 4th argument, post_height which sets post_height', function () {
      var newUser = new User('auser', 'apassword')
      var data = 'test data ftw'
      var pt = new Date()
      var ph = 305000
      var nc3 = Content.fromDataAndUser(data, newUser, pt, ph)
      nc3.getPostHeight() === ph
    })
  })

  describe('@verifySignature', function () {
    it('should return a boolean indicating whether a (data, ECDSA signature, ECDSA public key) tuple is consistent -- whether given signature was generated for given data by given pub key', function () {
      Content.verifySignature(data, testuser.sign(data), testuser.getPubKey()).should.eql(true)
      Content.verifySignature(data, User.randomTestUser().sign(data), testuser.getPubKey()).should.eql(false)
      Content.verifySignature(data, testuser.sign(data), User.randomTestUser().getPubKey()).should.eql(false)
      Content.verifySignature('other data!', testuser.sign(data), testuser.getPubKey()).should.eql(false)
    })

    it('should THROW AN ERROR if any argument is null or missing', function () {
      ;(function () {
        Content.verifySignature()
      }).should.throw()

      ;(function () {
        Content.verifySignature(null, testuser.sign(data), testuser.getPubKey())
      }).should.throw()

      ;(function () {
        Content.verifySignature(data, undefined, testuser.getPubKey())
      }).should.throw()

      ;(function () {
        Content.verifySignature(data, testuser.sign(data), null)
      }).should.throw()

    })

    it('should THROW AN ERROR if any argument is an IMPROPER TYPE OR INVALID', function () {
      ;(function () {
        Content.verifySignature(data, 'not a signature', testuser.getPubKey())
        Content.verifySignature(data, {'not': true, 'a': true, 'signature': true}, testuser.getPubKey())
      }).should.throw()

      ;(function () {
        Content.verifySignature(data, testuser.sign(data), 'not a public key')
        Content.verifySignature(data, testuser.sign(data), {'not': true, 'a': true, 'public': true, 'key': true})
      }).should.throw()

      ;(function () {
        Content.verifySignature({'not': true, 'normal': true, 'data': true}, testuser.sign(data), testuser.getPubKey())
      }).should.throw()
    })
  })

})
