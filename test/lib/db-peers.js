/* global describe,it,before,after */
'use strict'
let DB = require('../../lib/db')
let DBPeers = require('../../lib/db-peers')
let Peers = require('../../lib/peers')
let should = require('should')
let spawn = require('../../lib/spawn')

describe('DBPeers', function () {
  let db = DB('datt-testdatabase')

  before(function () {
    return db.asyncInitialize()
  })

  after(function () {
    return db.asyncDestroy()
  })

  it('should exist', function () {
    let dbpeers = DBPeers()
    should.exist(DBPeers)
    should.exist(DBPeers())
    should.exist(dbpeers)
  })

  describe('#asyncGetJSON', function () {
    it('should reject if peers doesnt exist', function () {
      return spawn(function *() {
        try {
          yield DBPeers(db).asyncGetJSON()
        } catch (err) {
          if (err.message === 'missing') {
            return Promise.resolve()
          }
        }
        return Promise.reject('should have thrown an error')
      })
    })
  })

  describe('#asyncSave', function () {
    it('should save a peers object with no connections', function () {
      return spawn(function *() {
        let peers = Peers()
        let res = yield DBPeers(db).asyncSave(peers)
        should.exist(res)
      })
    })
  })
})
