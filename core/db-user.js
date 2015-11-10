/**
 * DBUser
 * ======
 *
 * This class lets you save/get a user from the database, basically so that you
 * can persist "logins" across browser refreshes.
 */
'use strict'
let User = require('./user')
let Struct = require('fullnode/lib/struct')
let spawn = require('../util/spawn')

function DBUser (db, user) {
  if (!(this instanceof DBUser)) {
    return new DBUser(db, user)
  }
  this.fromObject({db, user})
}

DBUser.prototype = Object.create(Struct.prototype)
DBUser.prototype.constructor = DBUser

DBUser.prototype.asyncSave = function (user) {
  return spawn(function *() {
    if (!user) {
      user = this.user
    }
    this.user = user
    let _rev
    try {
      // We need to try retrieving the doc first so we can save it with the
      // correct _rev if it already exists
      let doc = yield this.db.asyncGet('user')
      _rev = doc._rev
    } catch (err) {
      if (err.message !== 'missing') {
        throw err
      }
    }
    let doc = {
      _id: 'user',
      _rev: _rev,
      user: user.toJSON()
    }
    return this.db.put(doc)
  }.bind(this))
}

DBUser.prototype.asyncGet = function () {
  return this.db.asyncGet('user').then(doc => {
    this.user = User().fromJSON(doc.user)
    return this.user
  })
}

module.exports = DBUser
