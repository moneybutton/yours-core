/* global it,describe,before */
var should = require('should')
var ContentStore = require('../lib/contentStore')
var User = require('../lib/user')
var Content = require('../lib/content')
var util = require('../lib/util')

describe('ContentStore', function () {
  this.timeout(10000) // karma seems to need longer timeout for IndexedDB tests
  var contentStore
  var content
  var data = 'test data'
  var user
  var hashHexString
  var storeLocation

  before(function (done) {
    user = new User('username', 'password')
    user.init().then(function () {
      Content.fromDataAndUser(data, user).then(function (newContent) {
        content = newContent
        hashHexString = content.getHashHex()
        storeLocation = './dbs/' + util._randomString(10)
        contentStore = new ContentStore({'dbName': storeLocation})
        contentStore.init().then(function () {
          done()
        })
      })

    })
  })

  describe('ContentStore', function () {
    it('should see the global content store', function () {
      should.exist(contentStore)
    })

  })

  describe('#putContent', function () {
    it('should put this content', function (done) {
      contentStore.putContent(content).then(function (hashhex) {
        hashhex.should.equal(hashHexString)
        done()
      })
    })
  })

  describe('#getContent', function () {
    it('should get this content', function (done) {
      console.log(hashHexString)
      contentStore.getContent(hashHexString).then(function (val) {
        should.exist(val)
        console.log(JSON.stringify(val, null, 4))
        val.getHashHex().should.eql(content.getHashHex())
        val.getData().should.eql(content.getData())
        val.getOwnerPubKey().should.eql(content.getOwnerPubKey())
        val.getOwnerAddress().should.eql(content.getOwnerAddress())
        val.serialize().should.eql(content.serialize())
        done()
      })
    })

  })

  describe('info', function () {
    it('provides db info', function (done) {
      contentStore.db.info().then(function () {
        console.log(JSON.stringify(arguments, null, 4))
        done()
      })
    })
  })

  after(function () {
    contentStore.destroyDB()
  })

})
