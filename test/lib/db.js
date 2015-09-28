/* global describe,it,before,after */
'use strict'
let DB = require('../../lib/db')
let should = require('should')

describe('DB', function () {
  let name = 'testdatabase'
  let db

  before(function () {
    db = DB(name)
    return db.init()
  })

  after(function () {
    return db.close()
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
})
