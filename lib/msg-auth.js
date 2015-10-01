/**
 * MsgAuth
 * =======
 *
 * A message to sign your username and possibly as-yet undecided other
 * information to be sent to peers.
 */
'use strict'
let dependencies = {
  AsyncCrypto: require('./asynccrypto'),
  BW: require('fullnode/lib/bw'),
  Msg: require('./msg'),
  Pubkey: require('fullnode/lib/pubkey'),
  Sig: require('fullnode/lib/sig'),
  Struct: require('fullnode/lib/struct')
}

let inject = function (deps) {
  let AsyncCrypto = deps.AsyncCrypto
  let BW = deps.BW
  let Msg = deps.Msg
  let Pubkey = deps.Pubkey
  let Sig = deps.Sig
  let Struct = deps.Struct

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
    this.jsonbuf = new Buffer('"{\"name\":\"noname\"}"')
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
    return AsyncCrypto.sha256(this.getBufForSig()).then(function (hashbuf) {
      return AsyncCrypto.verifyCompactSig(hashbuf, this.sig)
    }.bind(this)).then(function (info) {
      if (this.pubkey.point.eq(info.pubkey.point)) {
        return true
      } else {
        return false
      }
    }.bind(this))
  }

  return MsgAuth
}

inject = require('fullnode/lib/injector')(inject, dependencies)
let MsgAuth = inject()
module.exports = MsgAuth
