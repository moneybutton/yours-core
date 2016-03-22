/* global fullnode */
/**
 * DB BIP44 Wallet
 * ===============
 *
 * For storing a bip44wallet to the db.
 */
'use strict'
let BIP44Wallet = require('./bip44wallet')
let Struct = fullnode.Struct
let asink = require('asink')

function DBBIP44Wallet (db, bip44wallet) {
  if (!(this instanceof DBBIP44Wallet)) {
    return new DBBIP44Wallet(db, bip44wallet)
  }
  this.fromObject({db, bip44wallet})
}

DBBIP44Wallet.prototype = Object.create(Struct.prototype)
DBBIP44Wallet.prototype.constructor = DBBIP44Wallet

DBBIP44Wallet.prototype.asyncSave = function (bip44wallet) {
  return asink(function *() {
    if (!bip44wallet) {
      bip44wallet = this.bip44wallet
    }
    this.bip44wallet = bip44wallet
    let _rev
    try {
      // We need to try retrieving the doc first so we can save it with the
      // correct _rev if it already exists.
      let doc = yield this.db.asyncGet('bip44wallet')
      _rev = doc._rev
    } catch (err) {
      if (err.message !== 'missing') {
        throw err
      }
    }
    let doc = {
      _id: 'bip44wallet',
      _rev: _rev,
      bip44wallet: bip44wallet.toJSON()
    }
    return this.db.put(doc)
  }, this)
}

DBBIP44Wallet.prototype.asyncGet = function () {
  return asink(function *() {
    let doc = yield this.db.asyncGet('bip44wallet')
    this.bip44wallet = BIP44Wallet().fromJSON(doc.bip44wallet)
    return this.bip44wallet
  }, this)
}

module.exports = DBBIP44Wallet
