/* global describe,it,before,after */
'use strict'
let DB = require('../core/db')
let asink = require('asink')
let should = require('should')

describe('DB', function () {
  let db = DB('datt-testdatabase')
  let doc = {
    _id: 'test-document-id',
    data: 'test-data'
  }

  before(function () {
    return db.asyncInitialize()
  })

  after(function () {
    return db.asyncDestroy()
  })

  describe('#asyncInitialize', function () {
    it('should exist', function () {
      should.exist(db.asyncInitialize)
    })
  })

  describe('#close', function () {
    it('should exist', function () {
      should.exist(db.close)
    })
  })

  describe('#info', function () {
    it('should give some info', function () {
      return asink(function *() {
        let info = yield db.info()
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
      return asink(function *() {
        let errors = 0
        try {
          yield db.put(doc)
        } catch (err) {
          errors++
        }
        errors.should.equal(1)
      })
    })
  })

  describe('#asyncGet', function () {
    it('should get a piece of data', function () {
      return asink(function *() {
        let doc2 = yield db.asyncGet(doc._id)
        doc2.data.should.equal('test-data')
      })
    })
  })
})
