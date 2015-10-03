/**
 * MsgAuth
 * =======
 *
 * A message to sign your username and possibly as-yet undecided other
 * information to be sent to peers.
 */
'use strict'
let AsyncCrypto = require('./asynccrypto')
let BW = require('fullnode/lib/bw')
let Msg = require('./msg')
let Pubkey = require('fullnode/lib/pubkey')
let Sig = require('fullnode/lib/sig')
let Struct = require('fullnode/lib/struct')

function MsgAuth (pubkey, sig, blockhashbuf, blockheightnum, jsonbuf) {
  if (!(this instanceof MsgAuth)) {
    return new MsgAuth(pubkey, sig, blockhashbuf, blockheightnum, jsonbuf)
  }
  this.initialize()
  this.fromObject({
    pubkey: pubkey,
    sig: sig,
    blockhashbuf: blockhashbuf,
    blockheightnum: blockheightnum,
    jsonbuf: jsonbuf
  })
}

MsgAuth.prototype = Object.create(Struct.prototype)
MsgAuth.prototype.constructor = MsgAuth

MsgAuth.prototype.initialize = function () {
  this.jsonbuf = new Buffer('"{\"name\":\"satoshi\"}"')
  return this
}

 /**
  * Note that this method and the corresponding method of fromBuffer are slow
  * because of the pubkey .fromDER method, which operates on compressed
  * public keys. They should not be used when we don't want to block. TODO:
  * Create asynchronous versions of these somehow using AsyncCrypto.
  */
MsgAuth.prototype.fromBR = function (br) {
  this.pubkey = Pubkey().fromDER(br.read(33))
  this.sig = Sig().fromCompact(br.read(1 + 32 + 32))
  this.blockhashbuf = br.read(32)
  this.blockheightnum = br.readUInt32BE()
  this.jsonbuf = br.read()
  return this
}

MsgAuth.prototype.toBW = function (bw) {
  if (!bw) {
    bw = BW()
  }
  bw.write(this.pubkey.toDER(true))
  bw.write(this.sig.toCompact())
  bw.write(this.blockhashbuf)
  bw.writeUInt32BE(this.blockheightnum)
  bw.write(this.jsonbuf)
  return bw
}

MsgAuth.prototype.fromMsg = function (msg) {
  this.fromBuffer(msg.databuf)
  return this
}

MsgAuth.prototype.toMsg = function () {
  let buf = this.toBuffer()
  return Msg().setCmd('auth').setData(buf)
}

MsgAuth.prototype.setBlockInfo = function (blockhashbuf, blockheightnum) {
  this.blockhashbuf = blockhashbuf
  this.blockheightnum = blockheightnum
  return this
}

MsgAuth.prototype.setName = function (name) {
  this.jsonbuf = new Buffer(JSON.stringify({name: name}))
  return this
}

MsgAuth.prototype.getBufForSig = function () {
  let bw = BW()
  bw.write(this.blockhashbuf)
  bw.writeUInt32BE(this.blockheightnum)
  bw.write(this.jsonbuf)
  return bw.toBuffer()
}

MsgAuth.prototype.validate = function () {
  return AsyncCrypto.sha256(this.getBufForSig()).then(hashbuf => {
    return AsyncCrypto.verifyCompactSig(hashbuf, this.sig)
  }).then(info => {
    return this.pubkey.point.eq(info.pubkey.point)
  })
}

module.exports = MsgAuth
