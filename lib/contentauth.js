/* global fullnode */
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
let Address = fullnode.Address
let BN = fullnode.BN
let BSM = fullnode.BSM
let BW = fullnode.BW
let Content = require('./content')
let ECDSA = fullnode.ECDSA
let Hash = fullnode.Hash
let Keypair = fullnode.Keypair
let Pubkey = fullnode.Pubkey
let Sig = fullnode.Sig
let Struct = fullnode.Struct
let asink = require('asink')

/**
 * Note that the signature must be compact, meaning it has a recovery factor
 * and compressed factor. date is a javascript date object.
 */
function ContentAuth (pubkey, sig, blockhashbuf, blockheightnum, parenthashbuf, date, address, contentbuf) {
  if (!(this instanceof ContentAuth)) {
    return new ContentAuth(pubkey, sig, blockhashbuf, blockheightnum, parenthashbuf, date, address, contentbuf)
  }
  this.initialize()
  this.fromObject({pubkey, sig, blockhashbuf, blockheightnum, parenthashbuf, date, address, contentbuf})
}

ContentAuth.prototype = Object.create(Struct.prototype)
ContentAuth.prototype.constructor = ContentAuth

ContentAuth.prototype.initialize = function () {
  let buf = new Buffer(32)
  buf.fill(0)
  this.parenthashbuf = buf // Default to 'null' parent
  this.date = new Date()

  // TODO: Default address is useful for testing but is a bad idea in
  // production.
  this.address = Address().fromPubkeyHashbuf(buf.slice(0, 20))

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

/**
 * TODO: Note that this method and the corresponding methods of .fromBuffer and
 * .fromHex are blocking because they derive a public key from just the X
 * value, which requires elliptic curve multiplication. We either need to
 * create non-blocking versions of these methods (which could be done by going
 * to/from only the uncompressed pubkey), or we need to create async versions
 * of them.
 */
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
  let hashbuf = BSM.magicHash(this.getBufForSig())
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
  return asink(function *() {
    let hashbuf = yield BSM.asyncMagicHash(this.getBufForSig())
    let sig = yield ECDSA.asyncSign(hashbuf, keypair)
    let pubkey = keypair.pubkey
    sig = yield ECDSA.asyncCalcrecovery(sig, pubkey, hashbuf)
    this.sig = sig
    this.pubkey = pubkey
    return this
  }, this)
}

/**
 * Verify the signature with the public key and hash of the data. This method
 * uses cryptography synchronously. Do not use in the main thread.
 */
ContentAuth.prototype.verify = function () {
  let hashbuf = BSM.magicHash(this.getBufForSig())
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
  return asink(function *() {
    let hashbuf = yield BSM.asyncMagicHash(this.getBufForSig())
    let sig = this.sig
    let pubkey
    let verified = false
    try {
      pubkey = yield ECDSA.asyncSig2pubkey(sig, hashbuf)
      verified = yield ECDSA.asyncVerify(hashbuf, sig, pubkey)
    } catch (err) {
      pubkey = undefined
    }
    return verified
  }, this)
}

/**
 * Same as asyncVerify, except rejects upon failure.
 */
ContentAuth.prototype.asyncValidate = function () {
  return asink(function *() {
    let verified = yield this.asyncVerify()
    if (verified) {
      return this
    } else {
      throw new Error('invalid contentauth')
    }
  }, this)
}

ContentAuth.prototype.asyncValidate = function () {
}

ContentAuth.prototype.setContent = function (content) {
  this.contentbuf = content.toBuffer()
  return this
}

ContentAuth.prototype.getContent = function () {
  return Content().fromBuffer(this.contentbuf)
}

/**
 * "Set" the hash of this - of course, this is not really cryptographically
 * possible - we are setting the cache of the hash. Note that once we set the
 * hash, the hash is *not* computed, and thus needs to be set accurately or it
 * will be returned inaccurately.
 */
ContentAuth.prototype.setCacheHash = function (hashbuf) {
  // Note that this value is not returned with .toBuffer
  this.cachehash = hashbuf
  return this
}

ContentAuth.prototype.getCacheHash = function () {
  if (!this.cachehash) {
    throw new Error('cachehash is not set')
  }
  return this.cachehash
}

/**
 * Synchronous, blocking get hash method. Do not use in the main thread.
 */
ContentAuth.prototype.getHash = function () {
  if (this.cachehash) {
    return this.cachehash
  } else {
    this.cachehash = Hash.sha256(this.toBuffer())
    return this.cachehash
  }
}

/**
 * Either compute the hash and return it, or, if cached, return the cache.
 */
ContentAuth.prototype.asyncGetHash = function () {
  return asink(function *() {
    let buf = this.toBuffer()
    if (this.cachehash) {
      return Promise.resolve(this.cachehash)
    } else {
      let hashbuf = yield Hash.asyncSha256(buf)
      this.setCacheHash(hashbuf)
      return hashbuf
    }
  }, this)
}

module.exports = ContentAuth
