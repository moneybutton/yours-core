/* global describe,it */
'use strict'
let User = require('../lib/user')
let should = require('should')

describe('User', function () {
  it('should satisfy this basic API', function () {
    let user = User()
    should.exist(user)
  })

  describe('#fromRandom', function () {
    it('should make a new user', function () {
      let user = User().fromRandom()
      should.exist(user.masterbip32)
      user.name.should.equal('')
    })
  })
})
