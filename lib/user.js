/**
 * User
 * ====
 *
 * A Datt user.
 */
'use strict'
let dependencies = {
  BIP32: require('fullnode/lib/bip32'),
  Struct: require('fullnode/lib/struct')
}

let inject = function (deps) {
  let BIP32 = deps.BIP32
  let Struct = deps.Struct

  function User (masterbip32, name) {
    if (!(this instanceof User)) {
      return new User(masterbip32, name)
    }
    this.initialize()
    this.fromObject({
      masterbip32: masterbip32,
      name: name
    })
  }

  User.prototype = Object.create(Struct.prototype)
  User.prototype.constructor = User

  User.prototype.initialize = function () {
    return this
  }

  User.prototype.fromRandom = function () {
    this.masterbip32 = BIP32().fromRandom()
    this.name = ""
    return this
  }

  User.prototype.fromJSON = function (json) {
    this.masterbip32 = BIP32().fromString(json.masterbip32)
    this.name = json.name
    return this
  }

  User.prototype.toJSON = function () {
    return {
      masterbip32: this.masterbip32.toString(),
      name: this.name
    }
  }

  User.prototype.validate = function () {
    if (this.name.length > 25) {
      throw new Error('name is too long')
    }
    return this
  }

  return User
}

inject = require('fullnode/lib/injector')(inject, dependencies)
let User = inject()
module.exports = User
