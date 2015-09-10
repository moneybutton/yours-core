/* global before,describe,it */
/**
 * Integration tests for the browser.
 * TODO: rewrite to work both in node and a browser.
 */
var should = require('should')
var datt_node = require('../')
var PouchDB = require('pouchdb')

describe('Integration Tests For Browser (TODO: for node also)', function () {
  if (!process.browser) {
    return
  }

  // creating databases and establishing network connections takes time
  this.timeout(5000)

  var main1, hashhex1
  var main2

  before(function () {
    // clear our test databases first
    var pouchdb1 = new PouchDB('datt-store-1')
    var pouchdb2 = new PouchDB('datt-store-2')
    return pouchdb1.destroy().then(function () {
      return pouchdb2.destroy()
    })
  })

  it('should should init 1', function () {
    main1 = datt_node.createMain({
      host: document.location.hostname
    }, 'datt-store-1')
    should.exist(main1)

    return main1.init()
  })

  it('should should init 2', function () {
    main2 = datt_node.createMain({
      host: document.location.hostname
    }, 'datt-store-2')
    should.exist(main2)

    return main2.init()
  })

  it('should should authenticate as user 1', function () {
    return main1.signIn('testuser1', 'testpassword1')
  })

  it('should should authenticate as user 2', function () {
    return main2.signIn('testuser2', 'testpassword2')
  })

  it('should post new content as user 1', function () {
    return main1.addContent('test content 1').then(function (hashhex) {
      hashhex1 = hashhex
    })
  })

  it('should broadcast a message about the content as user 1', function () {
    // Note: we are not testing if this message is actually seen by anyone -
    // just that it doesn't cause an error.
    return main1.broadcastMessage('Added new content: ' + hashhex1)
  })

  it('should see posted hash as user 2', function () {
    return main2.getContent(hashhex1).then(function (res) {
      res.data.should.equal('test content 1')
    })
  })

})
