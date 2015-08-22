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

  before(function () {
    user = new User('username', 'password')
    content = Content.fromDataAndUser(data, user)
    hashHexString = content.getHashHex()
    storeLocation = './dbs/' + util._randomString(10)
    contentStore = new ContentStore({'dbName': storeLocation})
    contentStore.init()
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
        console.log(JSON.stringify(val, null, 4))
        done()
        return val
      })
    })

  })

  describe('info', function () {
    it('provides db info', function () {
      contentStore.db.info().then(function () {
        console.log(JSON.stringify(arguments, null, 4))
      })
    })
  })

  after(function () {
    contentStore.destroyDB()
  })

})
