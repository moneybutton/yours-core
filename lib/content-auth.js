/**
 * ContentAuth
 * ===========
 *
 * Authenticated content. This is content that has been signed. Note only has
 * the content been signed, but current block hash has also been signed to
 * prove the content is recent. Also included are a date (not to be trusted -
 * but is the date claimed by the signer), and also a possible reference to
 * other content, the parenthashbuf.
 *
 * This class contains cryptography and methods that block. You should not use
 * these methods directly from within the main thread. Always use workers for
 * cryptography.
 */
'use strict'
let Struct = require('fullnode/lib/struct')
let Content = require('./content')
let BW = require('fullnode/lib/bw')
let BN = require('fullnode/lib/bn')
let Sig = require('fullnode/lib/sig')
let Pubkey = require('fullnode/lib/pubkey')
let ECDSA = require('fullnode/lib/ecdsa')
let Hash = require('fullnode/lib/hash')
let Address = require('fullnode/lib/address')
let Keypair = require('fullnode/lib/keypair')
let AsyncCrypto = require('./async-crypto')

/**
 * Note that the signature must be compact, meaning it has a recovery factor
 * and compressed factor. date is a javascript date object.
 */
function ContentAuth (pubkey, sig, blockhashbuf, blockheightnum, parenthashbuf, date, address, contentbuf) {
  if (!(this instanceof ContentAuth)) {
    return new ContentAuth(pubkey, sig, blockhashbuf, blockheightnum, parenthashbuf, date, address, contentbuf)
  }
  this.initialize()
  this.fromObject({
    pubkey: pubkey,
    sig: sig,
    blockhashbuf: blockhashbuf,
    blockheightnum: blockheightnum,
    parenthashbuf: parenthashbuf,
    date: date,
    address: address,
    contentbuf: contentbuf
  })
}

ContentAuth.prototype = Object.create(Struct.prototype)
ContentAuth.prototype.constructor = ContentAuth

ContentAuth.prototype.initialize = function () {
  let buf = new Buffer(32)
  buf.fill(0)
  this.parenthashbuf = buf // Default to 'null' parent
  this.date = new Date()
  return this
}

ContentAuth.prototype.toBW = function (bw) {
  if (!bw) {
    bw = BW()
  }
  bw.write(this.pubkey.toDER(true))
  bw.write(this.sig.toCompact())
  bw.write(this.blockhashbuf)
  bw.writeUInt32BE(this.blockheightnum)
  bw.write(this.parenthashbuf)
  bw.writeUInt64BEBN(BN().fromNumber(this.date.getTime()))
  bw.write(this.address.toBuffer())
  bw.write(this.contentbuf)
  return bw
}

ContentAuth.prototype.fromBR = function (br) {
  this.pubkey = Pubkey().fromBuffer(br.read(33))
  this.sig = Sig().fromCompact(br.read(65))
  this.blockhashbuf = br.read(32)
  this.blockheightnum = br.readUInt32BE()
  this.parenthashbuf = br.read(32)
  this.date = new Date(BN().fromBuffer(br.read(8)).toNumber())
  this.address = Address().fromBuffer(br.read(21))
  this.contentbuf = br.read()
  return this
}

ContentAuth.prototype.getBufForSig = function () {
  let bw = BW()
  bw.write(this.blockhashbuf)
  bw.writeUInt32BE(this.blockheightnum)
  bw.write(this.parenthashbuf)
  bw.writeUInt64BEBN(BN().fromNumber(this.date.getTime()))
  bw.write(this.address.toBuffer())
  bw.write(this.contentbuf)
  return bw.toBuffer()
}

/**
 * This method uses cryptography synchronously. Do not use in the main thread.
 */
ContentAuth.prototype.sign = function (keypair) {
  let hashbuf = Hash.sha256(this.getBufForSig())
  let ecdsa = ECDSA().fromObject({
    hashbuf: hashbuf,
    keypair: keypair
  })
  ecdsa.sign()
  ecdsa.calcrecovery()
  let sig = ecdsa.sig
  this.pubkey = keypair.pubkey
  this.sig = sig
  return this
}

/**
 * Sign the content using a worker. This is safe to use in the main thread, as
 * it offloads the cryptography to workers.
 */
ContentAuth.prototype.asyncSign = function (keypair) {
  return AsyncCrypto.sha256(this.getBufForSig()).then(hashbuf => {
    return AsyncCrypto.signCompact(hashbuf, keypair.privkey)
  }).then(sig => {
    this.sig = sig
    this.pubkey = keypair.pubkey
    return this
  })
}

/**
 * Verify the signature with the public key and hash of the data. This method
 * uses cryptography synchronously. Do not use in the main thread.
 */
ContentAuth.prototype.verify = function () {
  let hashbuf = Hash.sha256(this.getBufForSig())
  let ecdsa = ECDSA().fromObject({
    hashbuf: hashbuf,
    sig: this.sig,
    keypair: Keypair().fromObject({pubkey: this.pubkey})
  })
  if (!ecdsa.verify().verified) {
    return false
  }

  // TODO: We may want to not check the recovery value as it is extra
  // computation that may not actaully be necessary. Perhaps we should let
  // people set an invalid recovery factor if they want. Using compact
  // signatures is more about using a simple signature format with a constant
  // size than it is about using the recovery value in our case.
  let pubkey2 = ecdsa.sig2pubkey()
  if (!pubkey2.point.eq(this.pubkey.point)) {
    return false
  }
  return true
}

ContentAuth.prototype.asyncVerify = function () {
  return AsyncCrypto.sha256(this.getBufForSig()).then(hashbuf => {
    return AsyncCrypto.verifyCompactSig(hashbuf, this.sig)
  }).then(info => {
    return info.verified && (info.pubkey.point.eq(this.pubkey.point))
  })
}

ContentAuth.prototype.setContent = function (content) {
  this.contentbuf = content.toBuffer()
  return this
}

ContentAuth.prototype.getContent = function () {
  return Content().fromBuffer(this.contentbuf)
}

module.exports = ContentAuth
