/* global describe,it,before,after */
'use strict'
let BIP44Wallet = require('../lib/bip44wallet')
let DB = require('../lib/db')
let DBBIP44Wallet = require('../lib/dbbip44wallet')
let asink = require('asink')
let should = require('should')

describe('DBBIP44Wallet', function () {
  let db = DB('datt-testdatabase')

  before(function () {
    return db.asyncInitialize()
  })

  after(function () {
    return db.asyncDestroy()
  })

  it('should exist', function () {
    should.exist(DBBIP44Wallet)
    should.exist(DBBIP44Wallet())
  })

  describe('#asyncRevHasChanged', function () {
    it('should know of the revision has changed', function () {
      return asink(function *() {
        let db = {
          asyncGet: () => {
            return {_rev: 'test2'}
          }
        }
        let dbbip44wallet = DBBIP44Wallet(db, undefined, 'test1')
        let res = yield dbbip44wallet.asyncRevHasChanged()
        res.should.equal(true)
      }, this)
    })

    it('should know of the revision has not changed', function () {
      return asink(function *() {
        let db = {
          asyncGet: () => {
            return {_rev: 'test1'}
          }
        }
        let dbbip44wallet = DBBIP44Wallet(db, undefined, 'test1')
        let res = yield dbbip44wallet.asyncRevHasChanged()
        res.should.equal(false)
      }, this)
    })

    it('should know of the revision has not changed if doc does not exist', function () {
      return asink(function *() {
        let db = {
          asyncGet: () => {
            throw new Error('missing')
          }
        }
        let dbbip44wallet = DBBIP44Wallet(db, undefined, 'test1')
        let res = yield dbbip44wallet.asyncRevHasChanged()
        res.should.equal(false)
      }, this)
    })
  })

  describe('#asyncSave', function () {
    it('should save this new wallet and not throw an error', function () {
      return asink(function *() {
        let bip44wallet = yield BIP44Wallet().asyncFromRandom()
        yield bip44wallet.asyncGetNewExtAddress(0)
        yield bip44wallet.asyncGetNewExtAddress(0)
        yield bip44wallet.asyncGetNewIntAddress(0)
        return DBBIP44Wallet(db).asyncSave(bip44wallet)
      }, this)
    })
  })

  describe('#asyncGet', function () {
    it('should get the previously saved wallet', function () {
      return asink(function *() {
        let bip44wallet = yield DBBIP44Wallet(db).asyncGet()
        ;(bip44wallet instanceof BIP44Wallet).should.equal(true)
      }, this)
    })
  })
})
