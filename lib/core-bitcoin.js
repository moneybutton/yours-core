/**
 * CoreBitcoin
 * ===========
 *
 * A window into bitcoin functionality. This class should not contain most
 * actualy logic, but should hook together logic about unspents with logic
 * about the blockchain, as well as peer connections necessary for this
 * information. For instance, there will probably be a blockchain object that
 * connects to a blockchain service. That object will be managed by this
 * object.
 */
'use strict'
let Struct = require('fullnode/lib/struct')
let BR = require('fullnode/lib/br')

function CoreBitcoin (db) {
  if (!(this instanceof CoreBitcoin)) {
    return new CoreBitcoin(db)
  }
  this.fromObject({
    db: db
  })
}

CoreBitcoin.prototype = Object.create(Struct.prototype)
CoreBitcoin.prototype.constructor = CoreBitcoin

CoreBitcoin.prototype.asyncGetLatestBlockInfo = function () {
  let idhex = '000000000000000010bf939fcce01f8f896d107febe519de2ebc75a4a29fef11'
  let idbuf = new Buffer(idhex, 'hex')
  let hashbuf = BR(idbuf).readReverse()
  let hashhex = hashbuf.toString('hex')
  return Promise.resolve({
    idbuf: idbuf,
    idhex: idhex,
    hashbuf: hashbuf,
    hashhex: hashhex,
    height: 376894
  })
}

module.exports = CoreBitcoin
