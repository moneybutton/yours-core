/**
 * DattNode
 * ========
 *
 * This is the entry point into the DattNode application.
 */
'use strict'
let dependencies = {
  AsyncCrypto: require('./asynccrypto'),
  DB: require('./db'),
  User: require('./user')
}

let inject = function (deps) {
  let AsyncCrypto = deps.AsyncCrypto
  let DB = deps.DB
  let User = deps.User

  function DattNode () {
  }

  DattNode.AsyncCrypto = AsyncCrypto
  DattNode.DB = DB
  DattNode.User = User

  return DattNode
}

inject = require('fullnode/lib/injector')(inject, dependencies)
let DattNode = inject()
module.exports = DattNode
global.DattNode = DattNode
