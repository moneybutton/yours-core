/* global describe,it,before,after */
'use strict'
let DB = require('../../lib/db')
let should = require('should')

describe('DB', function () {
  let name = 'datt-testdatabase'
  let db
  let doc = {
    _id: 'test-document-id',
    data: 'test-data'
  }

  before(function () {
    db = DB(name)
    return db.init()
  })

  after(function () {
    return db.destroy()
  })

  describe('#init', function () {
    it('should exist', function () {
      should.exist(db.init)
    })
  })

  describe('#close', function () {
    it('should exist', function () {
      should.exist(db.close)
    })
  })

  describe('#info', function () {
    it('should give some info', function () {
      return db.info().then(function (info) {
        should.exist(info)
        should.exist(info.db_name)
      })
    })
  })

  describe('#put', function () {
    it('should put a piece of data', function () {
      return db.put(doc)
    })

    it('should should get an update conflict if inserting again', function () {
      return db.put(doc)
        .then(function () {
          throw new Error('promise should not succeed')
        }).catch(function () {
          // expected
        })
    })
  })

  describe('#get', function () {
    it('should get a piece of data', function () {
      return db.get(doc._id).then(function (doc) {
        doc.data.should.equal('test-data')
      })
    })
  })
})
