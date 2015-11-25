/**
 * CryptoWorkers
 * ===========
 *
 * CryptoWorkers is a module for doing cryptography with an asynchronous
 * interface with web workers (browser) or child process forks (node). It uses
 * the workerpool module to automatically manage the workers with an interface
 * isomorphic between node and a browser (i.e., it works in both).
 */
'use strict'
let Address = require('fullnode/lib/address')
let BIP32 = require('fullnode/lib/bip32')
let Pubkey = require('fullnode/lib/pubkey')
let Sig = require('fullnode/lib/sig')
let Struct = require('fullnode/lib/struct')
let q = require('q')
let asink = require('asink')
let workerpool = require('workerpool')

let defaultPool
let cryptoWorkers

function CryptoWorkers (pool) {
  if (!(this instanceof CryptoWorkers)) {
    return new CryptoWorkers(pool)
  }
  if (!pool) {
    if (!defaultPool) {
      // Cache global worker pool, so if you create a new cryptoWorkers instance
      // it will use the global worker pool by default.
      if (!process.browser) {
        defaultPool = workerpool.pool(__dirname + '/worker.js')
      } else {
        defaultPool = workerpool.pool(process.env.DATT_JS_BASE_URL + process.env.DATT_CORE_JS_WORKER_FILE)
      }
    }
    pool = defaultPool
  }
  this.fromObject({pool})
}

CryptoWorkers.prototype = Object.create(Struct.prototype)
CryptoWorkers.prototype.constructor = CryptoWorkers

/**
 * The sha256 hash (buffer) of data (buffer). Note that we convert the data to
 * hex and transmit this to the worker. That is not efficient. TODO: For speed,
 * rewrite tranmission to copy (node) or transfer (browser) a buffer rather
 * than a hex string.
 */
CryptoWorkers.prototype.asyncSha256 = function sha256 (databuf) {
  return asink(function *() {
    let datahex = databuf.toString('hex')
    let hashhex = yield q(this.pool.exec('sha256', [datahex]))
    return new Buffer(hashhex, 'hex')
  }.bind(this))
}

/**
 * Derive a pubkey object from a privkey object in a worker. TODO: For
 * speed, rewrite transmission code to copy/transfer the buffer form of the
 * privkey to the worker and to send back the buffer form of the pubkey,
 * rather than copying JSON data.
 */
CryptoWorkers.prototype.asyncPubkeyFromPrivkey = function (privkey) {
  return asink(function *() {
    let privkeyHex = privkey.toHex()
    let pubkeyHex = yield q(this.pool.exec('pubkeyHexFromPrivkeyHex', [privkeyHex]))
    let pubkey = Pubkey().fromDER(new Buffer(pubkeyHex, 'hex'))
    return pubkey
  }.bind(this))
}

/**
 * Derive an address from a public key in a worker. TODO: For speed, replace
 * transmission code with buffers rather than JSON.
 */
CryptoWorkers.prototype.asyncAddressFromPubkey = function (pubkey) {
  return asink(function *() {
    let pubkeyHex = pubkey.toHex()
    let addressHex = yield q(this.pool.exec('addressHexFromPubkeyHex', [pubkeyHex]))
    return Address().fromHex(addressHex)
  }.bind(this))
}

/**
 * Derive the base58 string representation of an address. TODO: For speed,
 * replace transmission code with buffers rather than JSON.
 */
CryptoWorkers.prototype.asyncAddressStringFromAddress = function (address) {
  return asink(function *() {
    let addressHex = address.toHex()
    let addressString = yield q(this.pool.exec('addressStringFromAddressHex', [addressHex]))
    return addressString
  }.bind(this))
}

/**
 * Derive the xprv, xpub and mnemonic from an entropy buffer. That is, given
 * some random data of 128 bits, derive the extended private key and extended
 * public key from that entropy. TODO: Instead of sending hex or JSON to/from
 * the worker, send buffers to/from.
 */
CryptoWorkers.prototype.asyncXkeysFromEntropy = function (entropybuf) {
  return asink(function *() {
    let entropyhex = entropybuf.toString('hex')
    let obj = yield q(this.pool.exec('xkeysFromEntropyHex', [entropyhex]))
    let mnemonic = obj.mnemonic
    let xprv = BIP32().fromHex(obj.xprv)
    let xpub = BIP32().fromHex(obj.xpub)
    return {
      mnemonic: mnemonic,
      xprv: xprv,
      xpub: xpub
    }
  }.bind(this))
}

/**
 * Given an xprv (extended private key), derive the path to a new xprv and its
 * corresponding xpub and address (see BIP 32). TODO: Send buffers instead of
 * hex/JSON.
 */
CryptoWorkers.prototype.asyncDeriveXkeysFromXprv = function (xprv, path) {
  return asink(function *() {
    let xprvhex = xprv.toHex()
    let obj = yield q(this.pool.exec('deriveXkeysFromXprvHex', [xprvhex, path]))
    xprv = BIP32().fromHex(obj.xprv)
    let xpub = BIP32().fromHex(obj.xpub)
    let address = Address().fromHex(obj.address)
    return {xprv, xpub, address}
  }.bind(this))
}

/**
 * Given an xpub (extended public key), derive the path to a new xpub and its
 * corresponding xpub and address (see BIP 32). TODO: Send buffers instead of
 * hex/JSON.
 */
CryptoWorkers.prototype.asyncDeriveXkeysFromXpub = function (xpub, path) {
  return asink(function *() {
    let xpubhex = xpub.toHex()
    let obj = yield q(this.pool.exec('deriveXkeysFromXpubHex', [xpubhex, path]))
    xpub = BIP32().fromHex(obj.xpub)
    let address = Address().fromHex(obj.address)
    return {xpub, address}
  }.bind(this))
}

/**
 * Given a hash (32 byte buffer), privkey, and endian (either 'little' or
 * 'big', default 'big'), compute the Signature (using ECDSA). Returns a
 * fullnode Signature object. TODO: Send buffers instead of hex/JSON.
 */
CryptoWorkers.prototype.asyncSign = function (hash, privkey, endian) {
  return asink(function *() {
    let hashhex = hash.toString('hex')
    let privkeyHex = privkey.toHex()
    let sighex = yield q(this.pool.exec('sign', [hashhex, privkeyHex, endian]))
    return Sig().fromHex(sighex)
  }.bind(this))
}

/**
 * Compute the compact signature, which includes the "recovery" and
 * "compressed" properties that allow the signature to be converted into a
 * compact binary format.
 */
CryptoWorkers.prototype.asyncSignCompact = function (hashbuf, privkey) {
  return asink(function *() {
    let hashhex = hashbuf.toString('hex')
    let privkeyHex = privkey.toHex()
    let sighex = yield q(this.pool.exec('signCompact', [hashhex, privkeyHex]))
    return Sig().fromCompact(new Buffer(sighex, 'hex'))
  }.bind(this))
}

/**
 * Use ECDSA to verify if the signature is valid, i.e. it corresponds to the
 * hash and public key. TODO: Send buffers instead of hex/JSON.
 */
CryptoWorkers.prototype.asyncVerifySignature = function verifySignature (hash, signature, pubkey) {
  return asink(function *() {
    if (!hash || !signature || !pubkey) {
      throw new Error('verifySignature takes 3 arguments: hash, signature, and pubkey')
    }
    let hashhex = hash.toString('hex')
    let pubkeyHex = pubkey.toDER(false).toString('hex')
    let signatureHex = signature.toHex()
    return q(this.pool.exec('verifySignature', [hashhex, signatureHex, pubkeyHex]))
  }.bind(this))
}

/**
 * This takes the hash that was signed, and a *compact* signature, which must
 * have the recovery and compressed properties set. It will then return an
 * object containing whether the signature was verified, and what the derived
 * public key was (because it is possible to derive a public key from a
 * compact signature)
 *
 * TODO: Send buffers instead of hex/JSON
 */
CryptoWorkers.prototype.asyncVerifyCompactSig = function (hashbuf, sig) {
  return asink(function *() {
    if (sig.recovery === undefined || sig.compressed === undefined) {
      throw new Error('verifyCompactSig takes a compact signature only')
    }
    let signatureHex = sig.toCompact().toString('hex')
    let hashhex = hashbuf.toString('hex')
    let obj = yield q(this.pool.exec('verifyCompactSig', [hashhex, signatureHex]))
    return {
      verified: obj.verified,
      pubkey: obj.pubkey ? Pubkey().fromDER(new Buffer(obj.pubkey, 'hex')) : undefined
    }
  }.bind(this))
}

cryptoWorkers = new CryptoWorkers()
for (let method in CryptoWorkers.prototype) {
  // This javascript wizardry makes it possible to use methods like
  // CryptoWorkers.asyncSha256 that will re-use the same global cryptoWorkers object for
  // convenience
  CryptoWorkers[method] = CryptoWorkers.prototype[method].bind(cryptoWorkers)
}

module.exports = CryptoWorkers
