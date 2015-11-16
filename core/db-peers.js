/**
 * DBPeers
 * =======
 *
 * For storing peer information, particularly who we are presently connected
 * to, to the database.
 */
'use strict'
let Struct = require('fullnode/lib/struct')
let asink = require('asink')

function DBPeers (db, peers) {
  if (!(this instanceof DBPeers)) {
    return new DBPeers(db, peers)
  }
  this.fromObject({db, peers})
}

DBPeers.prototype = Object.create(Struct.prototype)
DBPeers.prototype.constructor = DBPeers

/**
 * Save peers to the database. Useful so that should the application crash, we
 * can connect to the same peers as before without having to do peer discovery.
 */
DBPeers.prototype.asyncSave = function (peers) {
  return asink(function *() {
    if (!peers) {
      peers = this.peers
    }
    this.peers = peers
    let _rev
    try {
      // We need to try retrieving the doc first so we can save it with the
      // correct _rev if it already exists.
      let doc = yield this.db.asyncGet('peers')
      _rev = doc._rev
    } catch (err) {
      if (err.message !== 'missing') {
        throw err
      }
    }
    let doc = {
      _id: 'peers',
      _rev: _rev,
      peers: peers.toJSON()
    }
    return this.db.put(doc)
  }.bind(this))
}

/**
 * Get the list of peers saved to the database in JSON. This does not return a
 * Peers object. You should put the JSON retrieved from this into
 * peers.asyncConnectManyFromJSON. Note that we do not automatically reconnect
 * to the peers - this merely returns a peers object with the peers set. You
 * still need to actually connect to them.
 */
DBPeers.prototype.asyncGetJSON = function () {
  return this.db.asyncGet('peers').then(doc => {
    return doc.peers
  })
}

module.exports = DBPeers
