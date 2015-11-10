/* global describe,it */
'use strict'
let User = require('../../core/user')
let should = require('should')

describe('User', function () {
  let userJSON = {
    mnemonic: 'hope under ripple purity provide include crew nation family valve spirit napkin',
    masterxprv: '0488ade4000000000000000000c3ba9c537f9a302fc473b01574c66a3e3d0a0acc6e524c089c79b54cad7d32a200f9206ad1a367839633db64876cfd29fdd91310c7e12e8d9e0857effec617282c',
    masterxpub: '0488b21e000000000000000000c3ba9c537f9a302fc473b01574c66a3e3d0a0acc6e524c089c79b54cad7d32a2028607d532ab1ceeb17e20e449005156fffe01d4e0d3e6bfb265034524a6005a47',
    name: 'my_username'
  }

  it('should satisfy this basic API', function () {
    let user = User()
    should.exist(user)
  })

  describe('#fromRandom', function () {
    it('should create a new user', function () {
      let user = User().fromRandom()
      should.exist(user.mnemonic)
      should.exist(user.masterxprv)
      should.exist(user.masterxpub)
    })
  })

  describe('#asyncFromRandom', function () {
    it('should make a new user', function () {
      let user = User()
      return user.asyncFromRandom().then((user2) => {
        user.should.equal(user2)
        should.exist(user.mnemonic)
        should.exist(user.masterxprv)
        should.exist(user.masterxpub)
        user.name.should.equal('satoshi')
      })
    })
  })

  describe('#fromJSON', function () {
    it('should get a user from this json', function () {
      let user = User().fromJSON(userJSON)
      should.exist(user.name)
      should.exist(user.mnemonic)
      should.exist(user.masterxprv)
      should.exist(user.masterxpub)
    })
  })

  describe('#toJSON', function () {
    it('should get a user from this json', function () {
      let json = User().fromJSON(userJSON).toJSON()
      JSON.stringify(json).should.equal(JSON.stringify(userJSON))
    })
  })

  describe('#setName', function () {
    it('should set the name of this user', function () {
      let user = User().fromJSON(userJSON)
      user.setName('new username')
      user.name.should.equal('new username')
    })
  })

  describe('#keyIsSet', function () {
    it('should return true if the master key is set', function () {
      let user = User().fromJSON(userJSON)
      user.keyIsSet().should.equal(true)
    })

    it('should return false if the master key is not set', function () {
      let user = User().fromJSON(userJSON)
      user.mnemonic = undefined
      user.keyIsSet().should.equal(false)
    })
  })

  describe('#isSet', function () {
    it('should return true if things are set', function () {
      let user = User().fromJSON(userJSON)
      user.isSet().should.equal(true)
    })

    it('should return false if things are not set', function () {
      let user = User().fromJSON(userJSON)
      user.name = ''
      user.isSet().should.equal(false)
    })
  })
})
