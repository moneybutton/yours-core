/* global it,describe,before,after */
var should = require('should')
var ContentStore = require('../lib/contentStore')
var User = require('../lib/user')
var Content = require('../lib/content')
var util = require('../lib/util')
var os = require('os')
var tmpdir = os.tmpdir()

var bitcore = require('bitcore')
var q = require('q')
var u = require('underscore')

describe('ContentStore', function () {
  this.timeout(15000) // karma seems to need longer timeout for IndexedDB tests
  var contentStore
  var content
  var content2
  var data = 'test data'
  var data2 = 'test data 2'
  var user
  var hashHexString
  var hashHexString2
  var storeLocation

  before(function () {
    user = new User('username', 'password')
    return user.init().then(function () {
      return Content.fromDataAndUser(data, user)
    }).then(function (newContent) {
      content = newContent
      return Content.fromDataAndUser(data2, user)
    }).then(function (newContent) {
      content2 = newContent
      hashHexString = content.getHashHex()
      hashHexString2 = content2.getHashHex()
      storeLocation = tmpdir + '/' + util._randomString(10)
      contentStore = new ContentStore({'dbName': storeLocation})
      return contentStore.init()
    })
  })

  describe('ContentStore', function () {
    it('should see the global content store', function () {
      should.exist(contentStore)
    })

  })

  describe('#putContent', function () {
    it('should put this content', function () {
      return contentStore.putContent(content).then(function (hashhex) {
        hashhex.should.equal(hashHexString)
      })
    })
  })

  describe('#getContent', function () {
    it('should get this content', function () {
      return contentStore.getContent(hashHexString).then(function (val) {
        should.exist(val)
        val.getHashHex().should.eql(content.getHashHex())
        val.getData().should.eql(content.getData())
        val.getOwnerPubKey().should.eql(content.getOwnerPubKey())
        val.getOwnerAddress().should.eql(content.getOwnerAddress())
        val.serialize().should.eql(content.serialize())
      })
    })

  })

  describe('#getContentByUsername', function () {
    it('should return an array', function () {
      return contentStore.getContentByUsername('username').then(function (result) {
        should.exist(result)
        should(result instanceof Array).be.eql(true)
      })
    })

    it('should return an empty array when a username without associated content is provided', function () {
      return contentStore.getContentByUsername('a_random_username_with_no_content')
        .catch(function (err) {
          should.fail('Should not throw error: ' + err + ' \n\n ' + err.stack)
        })
        .then(function (result) {
          should.exist(result)
          should(result instanceof Array).be.eql(true)
          should(result.length).be.eql(0)
        })
    })

    it('should return content with the provided username', function () {
      return contentStore.getContentByUsername(content.getOwnerUsername()).then(function (result) {
        should.exist(result)
        should(result.length).be.eql(1)
        var retrievedContent = result[0]
        should(retrievedContent.getHashHex()).be.eql(content.getHashHex())
        should(retrievedContent.getOwnerUsername()).be.eql(content.getOwnerUsername())
      })
    })

    it('should reject the promise if username is undefined, null, or not a string', function () {
      return q.allSettled([
        contentStore.getContentByUsername(),
        contentStore.getContentByUsername(null),
        contentStore.getContentByUsername({'type': 'wrong'})
      ]).spread(function (undefinedUsername, nullUsername, wrongTypeUsername) {
        undefinedUsername.state.should.eql('rejected')
        nullUsername.state.should.eql('rejected')
        wrongTypeUsername.state.should.eql('rejected')
      })
    })
  })

  describe('#getContentByUserAddress', function () {
    it('should return an array containing Content instances where owner address matches the one provided', function () {
      return contentStore.getContentByUserAddress(content.getOwnerAddress()).then(function (results) {
        should.exist(results)
        should(results instanceof Array).be.eql(true)
        should(results.length).be.above(0)

        var numMatching = u.map(results, function (result) {
          if (result instanceof Content) {
            return result.getOwnerAddress()
          } else {
            return null
          }
        })
          .filter(function (address) { return address === content.getOwnerAddress() })
          .length
        should(results.length).be.eql(numMatching)
      })
    })

    it('should return an empty array when an address without associated content is provided', function () {
      var pkey = new bitcore.PrivateKey()
      var newAddress = pkey.toAddress().toString()
      return contentStore.getContentByUserAddress(newAddress)
        .catch(function (err) {
          should.fail('Should not throw error: ' + err + ' \n\n ' + err.stack)
        })
        .then(function (results) {
          should.exist(results)
          should(results instanceof Array).be.eql(true)
          should(results.length).be.eql(0)
        })
    })

    // it('should reject the promise if address is not a valid bitcoin address', function () {
    // 	  return contentStore.getContentByUserAddress('1InvalidBitcoinAddress')
    // 	      .catch(function (err) {
    // 		  should.exist(err)
    // 	      })
    // 		  .then(function () {
    // 		      should.fail('ContentStore#getContentByUserAddress should reject promise if the address provided is not a valid bitcoin address')
    // 		  })
    // })

    it('should reject the promise if address is undefined, null, or not a string', function () {
      return q.allSettled([
        contentStore.getContentByUserAddress(),
        contentStore.getContentByUserAddress(null),
        contentStore.getContentByUserAddress({'type': 'wrong'})
      ]).spread(function (undefinedUserAddress, nullUserAddress, wrongTypeUserAddress) {
        undefinedUserAddress.state.should.eql('rejected')
        nullUserAddress.state.should.eql('rejected')
        wrongTypeUserAddress.state.should.eql('rejected')
      })
    })
  })

  describe('#getContentHashes', function () {
    it('should return an array', function () {
      return contentStore.getContentHashes().then(function (hashes) {
        should.exist(hashes)
        should(hashes instanceof Array).be.eql(true)
      })
    })

    it('should return an array of strings, each one a Content hash, which includes the Content we inserted earlier', function () {
      return contentStore.putContent(content2).then(function () {
        return contentStore.getContentHashes()
      }).then(function (hashes) {
        var stringElements = u.filter(
          u.map(hashes, function (el) { return typeof (el._id) }),
          function (typeofel) { return typeofel === 'string' }
        )
        stringElements.length.should.eql(hashes.length)

        hashes = u.map(hashes, function (obj) {return obj._id})
        should(hashes.indexOf(hashHexString2)).not.eql(-1)
      })
    })

    it('should return an array with a count equal to the number of docs in the PouchDB minus the number of indices (2)', function () {
      return q.all([contentStore.db.info(), contentStore.getContentHashes()])
        .spread(function (info, hashes) {
          should.exist(hashes)
          should.exist(info)
          should(hashes.length).be.eql(info.doc_count - 2)
        })
    })

    it('should return an empty array without error if the content store is empty', function () {
      var storeLocation = tmpdir + '/' + util._randomString(10)
      var emptyContentStore = new ContentStore({'dbName': storeLocation})
      return emptyContentStore.init().then(function () {
        return emptyContentStore.getContentHashes()
      }).catch(function (err) {
        should.fail('Should not throw an error: ' + err + ' \n\n ' + (err || {}).stack)
      }).then(function (hashes) {
        should.exist(hashes)
        should(hashes instanceof Array).be.eql(true)
        should(hashes.length).be.eql(0)
      })
    })
  })

  describe('info', function () {
    it('provides db info', function () {
      return contentStore.db.info().then(function () {})
    })
  })

  after(function () {
    contentStore.destroyDB()
  })

})
