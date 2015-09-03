var bitcore = require('bitcore')
var q = require('q')
var workerpool = require('workerpool')
var logger = require('./logger')
var pool
var asyncCrypto

/**
 * AsyncCrypto is a module for doing cryptography with an asynchronous
 * interface with web workers (browser) or child process forks (node). It uses
 * the workerpool module to automatically manage the workers with an interface
 * isomorphic between node and a browser (i.e., it works in both).
 */
function AsyncCrypto (_pool) {
  if (!(this instanceof AsyncCrypto)) {
    return new AsyncCrypto(_pool)
  }
  if (!_pool) {
    if (!pool) {
      // Cache global worker pool, so if you create a new asyncCrypto instance
      // it will use the global worker pool by default.
      if (!process.browser) {
        pool = workerpool.pool(__dirname + '/worker.js')
      } else {
        pool = workerpool.pool(process.env.DATT_NODE_JS_BASE_URL + process.env.DATT_NODE_JS_WORKER_FILE)
      }
    }
    this.pool = pool
  } else {
    // If you want to set your own worker pool, you can do so by specifying
    // them in the constructor.
    this.pool = _pool
  }
}

/**
 * The sha256 hash (buffer) of data (buffer). Note that we convert the data to
 * hex and transmit this to the worker. That is not efficient. TODO: For speed,
 * rewrite tranmission to copy (node) or transfer (browser) a buffer rather
 * than a hex string.
 */
AsyncCrypto.prototype.sha256 = function sha256 (databuf) {
  var datahex = databuf.toString('hex')
  return q(this.pool.exec('sha256', [datahex])).then(function (hashhex) {
    return new Buffer(hashhex, 'hex')
  })
}

/**
 * Derive a publicKey object from a privateKey object in a worker. TODO: For
 * speed, rewrite transmission code to copy/transfer the buffer form of the
 * privateKey to the worker and to send back the buffer form of the publicKey,
 * rather than copying JSON data.
 */
AsyncCrypto.prototype.publicKeyFromPrivateKey = function (privateKey) {
  var privateKeyObject = privateKey.toObject()
  return q(this.pool.exec('publicKeyHexFromPrivateKeyObject', [privateKeyObject])).then(function (publicKeyHex) {
    var publicKey = new bitcore.PublicKey(publicKeyHex, {
      compressed: privateKey.compressed,
      network: privateKey.network
    })
    return publicKey
  })
}

/**
 * Derive an address from a public key in a worker. TODO: For speed, replace
 * transmission code with buffers rather than JSON.
 */
AsyncCrypto.prototype.addressFromPublicKey = function (publicKey) {
  var publicKeyHex = publicKey.toBuffer('hex')
  return q(this.pool.exec('addressHexFromPublicKeyHex', [publicKeyHex])).then(function (addressHex) {
    return bitcore.Address.fromBuffer(new Buffer(addressHex, 'hex'))
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
  var seedhex = seedbuf.toString('hex')
  return q(this.pool.exec('xkeysFromSeedHex', [seedhex])).then(function (obj) {
    var mnemonic = obj.mnemonic
    var xprv = bitcore.HDPrivateKey.fromObject(obj.xprv)
    var xpub = bitcore.HDPublicKey.fromObject(obj.xpub)
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
  var xprvobj = xprv.toObject()
  return q(this.pool.exec('deriveXkeysFromXprvObject', [xprvobj, path])).then(function (obj) {
    var xprv = bitcore.HDPrivateKey.fromObject(obj.xprv)
    var xpub = bitcore.HDPublicKey.fromObject(obj.xpub)
    var address = bitcore.Address.fromBuffer(new Buffer(obj.address, 'hex'))
    return {
      xprv: xprv,
      xpub: xpub,
      address: address
    }
  })
}

/**
 * Given a hash (32 byte buffer), privateKey, and endian (either 'little' or
 * 'big', default 'big'), compute the Signature (using ECDSA). Returns a
 * bitcore Signature object. TODO: Send buffers instead of hex/JSON.
 */
AsyncCrypto.prototype.sign = function (hash, privateKey, endian) {
  var hashhex = hash.toString('hex')
  var privateKeyHex = privateKey.toBuffer().toString('hex')
  return q(this.pool.exec('sign', [hashhex, privateKeyHex, endian])).then(function (sighex) {
    return bitcore.crypto.Signature.fromBuffer(new Buffer(sighex, 'hex'))
  })
}

/**
 * Use ECDSA to verify if the signature is valid, i.e. it corresponds to the
 * hash and public key. TODO: Send buffers instead of hex/JSON.
 */
AsyncCrypto.prototype.verifySignature = function verifySignature (hash, signature, publicKey) {
  if (!hash || !signature || !publicKey) {
    return q.reject(new Error('Workers#verifySignature needs 3 non-null, defined arguments: hash, signature, and publicKey'))
  }
  try {
    var hashhex = hash.toString('hex')
    var publicKeyHex = publicKey.toBuffer().toString('hex')
    var signatureHex = signature.toBuffer().toString('hex')

    return q(this.pool.exec('verifySignature', [hashhex, signatureHex, publicKeyHex]))
  } catch (exc) {
    logger.debug(exc)
    logger.debug(exc.stack)
    return q.reject(exc)
  }
}

asyncCrypto = new AsyncCrypto()
for (var method in AsyncCrypto.prototype) {
  // This javascript wizardry makes it possible to use methods like
  // AsyncCrypto.sha256 that will re-use the same global asyncCrypto object for
  // convenience
  AsyncCrypto[method] = AsyncCrypto.prototype[method].bind(asyncCrypto)
}

module.exports = AsyncCrypto
