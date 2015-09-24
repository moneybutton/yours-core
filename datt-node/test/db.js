/* global describe,it */
'use strict'
let DB = require('../lib/db')
let should = require('should')

describe('DB', function () {
  let db

  it('should open a database', function () {
    let name = 'testdatabase'
    db = DB(name)
    return db.init().then(function (info) {
      should.exist(info)
    })
  })
})
