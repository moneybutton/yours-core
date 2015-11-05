/**
 * CorePeers
 * =========
 *
 * An API for controlling peers. Can establish connections and receive
 * connections to peers on the datt p2p network. This is what's used by
 * dattcore. It is primarily a link to Peers, which actually manages the peers,
 * and DBPeers, which also keeps peer information stored in the database.
 */
'use strict'
// let Peers = require('./peers')
// let DBPeers = require('./db-peers')
let Struct = require('fullnode/lib/struct')

function CorePeers (db, dbpeers, peers) {
  if (!(this instanceof CorePeers)) {
    return new CorePeers(db, dbpeers, peers)
  }
  this.fromObject({db, dbpeers, peers})
}

CorePeers.prototype = Object.create(Struct.prototype)
CorePeers.prototype.constructor = CorePeers

module.exports = CorePeers
