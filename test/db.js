/* global describe,it */
'use strict'
let DB = require('../lib/db')
let should = require('should')

describe('DB', function () {
  it('should open a database', function () {
    let name = 'testdatabase'
    let db = DB(name)
    return db.initialize().info().then(function (info) {
      should.exist(info)
    })
  })
})
