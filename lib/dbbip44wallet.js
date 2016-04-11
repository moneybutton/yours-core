/* global Fullnode */
/**
 * DB BIP44 Wallet
 * ===============
 *
 * For storing a bip44wallet to the db.
 */
'use strict'
let BIP44Wallet = require('./bip44wallet')
let Struct = Fullnode.Struct
let asink = require('asink')

function DBBIP44Wallet (db, bip44wallet, _rev) {
  if (!(this instanceof DBBIP44Wallet)) {
    return new DBBIP44Wallet(db, bip44wallet, _rev)
  }
  this.fromObject({db, bip44wallet, _rev})
}

DBBIP44Wallet.prototype = Object.create(Struct.prototype)
DBBIP44Wallet.prototype.constructor = DBBIP44Wallet

DBBIP44Wallet.prototype.asyncRevHasChanged = function () {
  return asink(function *() {
    let doc
    try {
      doc = yield this.db.asyncGet('bip44wallet')
    } catch (err) {
      if (err.message === 'missing') {
        return false
      } else {
        throw err
      }
    }
    return doc._rev !== this._rev
  }, this)
}

DBBIP44Wallet.prototype.asyncSave = function (bip44wallet) {
  return asink(function *() {
    if (!bip44wallet) {
      bip44wallet = this.bip44wallet
    }
    let doc = {
      _id: 'bip44wallet',
      _rev: this._rev,
      bip44wallet: bip44wallet.toJSON()
    }
    let res = yield this.db.put(doc)
    this._rev = res.rev
    return res
  }, this)
}

DBBIP44Wallet.prototype.asyncGet = function () {
  return asink(function *() {
    let doc = yield this.db.asyncGet('bip44wallet')
    this.bip44wallet = BIP44Wallet().fromJSON(doc.bip44wallet)
    this._rev = doc._rev
    return this.bip44wallet
  }, this)
}

module.exports = DBBIP44Wallet
