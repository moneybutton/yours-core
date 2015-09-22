/**
 * AsyncCrypto
 * ===========
 *
 * AsyncCrypto is a module for doing cryptography with an asynchronous
 * interface with web workers (browser) or child process forks (node). It uses
 * the workerpool module to automatically manage the workers with an interface
 * isomorphic between node and a browser (i.e., it works in both).
 */
'use strict'
let dependencies = {
  Address: require('fullnode/lib/address'),
  BIP32: require('fullnode/lib/bip32'),
  Pubkey: require('fullnode/lib/pubkey'),
  Sig: require('fullnode/lib/sig'),
  Struct: require('fullnode/lib/struct'),
  q: require('q'),
  workerpool: require('workerpool')
}

let inject = function (deps) {
  let Address = deps.Address
  let BIP32 = deps.BIP32
  let Pubkey = deps.Pubkey
  let Sig = deps.Sig
  let Struct = deps.Struct
  let q = deps.q
  let workerpool = deps.workerpool

  let defaultPool
  let asyncCrypto

  function AsyncCrypto (pool) {
    if (!(this instanceof AsyncCrypto)) {
      return new AsyncCrypto(pool)
    }
    if (!pool) {
      if (!defaultPool) {
        // Cache global worker pool, so if you create a new asyncCrypto instance
        // it will use the global worker pool by default.
        if (!process.browser) {
          defaultPool = workerpool.pool(__dirname + '/worker.js')
        } else {
          defaultPool = workerpool.pool(process.env.DATT_NODE_JS_BASE_URL + process.env.DATT_NODE_JS_WORKER_FILE)
        }
      }
      pool = defaultPool
    }
    this.fromObject({
      pool: pool
    })
  }

  AsyncCrypto.prototype = Object.create(Struct.prototype)
  AsyncCrypto.prototype.constructor = AsyncCrypto

  /**
   * The sha256 hash (buffer) of data (buffer). Note that we convert the data to
   * hex and transmit this to the worker. That is not efficient. TODO: For speed,
   * rewrite tranmission to copy (node) or transfer (browser) a buffer rather
   * than a hex string.
   */
  AsyncCrypto.prototype.sha256 = function sha256 (databuf) {
    let datahex = databuf.toString('hex')
    return q(this.pool.exec('sha256', [datahex])).then(function (hashhex) {
      return new Buffer(hashhex, 'hex')
    })
  }

  /**
   * Derive a pubkey object from a privkey object in a worker. TODO: For
   * speed, rewrite transmission code to copy/transfer the buffer form of the
   * privkey to the worker and to send back the buffer form of the pubkey,
   * rather than copying JSON data.
   */
  AsyncCrypto.prototype.pubkeyFromPrivkey = function (privkey) {
    let privkeyHex = privkey.toHex()
    return q(this.pool.exec('pubkeyHexFromPrivkeyHex', [privkeyHex])).then(function (pubkeyHex) {
      let pubkey = Pubkey().fromHex(pubkeyHex)
      return pubkey
    })
  }

  /**
   * Derive an address from a public key in a worker. TODO: For speed, replace
   * transmission code with buffers rather than JSON.
   */
  AsyncCrypto.prototype.addressFromPubkey = function (pubkey) {
    let pubkeyHex = pubkey.toHex()
    return q(this.pool.exec('addressHexFromPubkeyHex', [pubkeyHex])).then(function (addressHex) {
      return Address().fromHex(addressHex)
    })
  }

  /**
   * Derive the xprv, xpub and mnemonic from a seed buffer. That is, given some
   * random data of 128 bits, derive the extended private key and extended public
   * key from that seed. TODO: rename seed to entropy to be compatible with BIP
   * 39. TODO: Instead of sending hex or JSON to/from the worker, send buffers
   * to/from.
   */
  AsyncCrypto.prototype.xkeysFromSeed = function (seedbuf) {
    let seedhex = seedbuf.toString('hex')
    return q(this.pool.exec('xkeysFromSeedHex', [seedhex])).then(function (obj) {
      let mnemonic = obj.mnemonic
      let xprv = BIP32().fromHex(obj.xprv)
      let xpub = BIP32().fromHex(obj.xpub)
      return {
        mnemonic: mnemonic,
        xprv: xprv,
        xpub: xpub
      }
    })
  }

  /**
   * Given an xprv (extended private key), derive the path to a new xprv and its
   * corresponding xpub and address (see BIP 32). TODO: Send buffers instead of
   * hex/JSON.
   */
  AsyncCrypto.prototype.deriveXkeysFromXprv = function (xprv, path) {
    let xprvhex = xprv.toHex()
    return q(this.pool.exec('deriveXkeysFromXprvHex', [xprvhex, path])).then(function (obj) {
      let xprv = BIP32().fromHex(obj.xprv)
      let xpub = BIP32().fromHex(obj.xpub)
      let address = Address().fromHex(obj.address)
      return {
        xprv: xprv,
        xpub: xpub,
        address: address
      }
    })
  }

  /**
   * Given a hash (32 byte buffer), privkey, and endian (either 'little' or
   * 'big', default 'big'), compute the Signature (using ECDSA). Returns a
   * fullnode Signature object. TODO: Send buffers instead of hex/JSON.
   */
  AsyncCrypto.prototype.sign = function (hash, privkey, endian) {
    let hashhex = hash.toString('hex')
    let privkeyHex = privkey.toHex()
    return q(this.pool.exec('sign', [hashhex, privkeyHex, endian])).then(function (sighex) {
      return Sig().fromHex(sighex)
    })
  }

  /**
   * Use ECDSA to verify if the signature is valid, i.e. it corresponds to the
   * hash and public key. TODO: Send buffers instead of hex/JSON.
   */
  AsyncCrypto.prototype.verifySignature = function verifySignature (hash, signature, pubkey) {
    if (!hash || !signature || !pubkey) {
      return q.reject(new Error('verifySignature needs 3 non-null, defined arguments: hash, signature, and pubkey'))
    }
    let hashhex = hash.toString('hex')
    let pubkeyHex = pubkey.toHex()
    let signatureHex = signature.toHex()
    return q(this.pool.exec('verifySignature', [hashhex, signatureHex, pubkeyHex]))
  }

  asyncCrypto = new AsyncCrypto()
  for (let method in AsyncCrypto.prototype) {
    // This javascript wizardry makes it possible to use methods like
    // AsyncCrypto.sha256 that will re-use the same global asyncCrypto object for
    // convenience
    AsyncCrypto[method] = AsyncCrypto.prototype[method].bind(asyncCrypto)
  }

  return AsyncCrypto
}

inject = require('fullnode/lib/injector')(inject, dependencies)
let AsyncCrypto = inject()
module.exports = AsyncCrypto
