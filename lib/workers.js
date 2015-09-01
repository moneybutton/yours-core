var bitcore = require('bitcore')
var q = require('q')
var workerpool = require('workerpool')
var logger = require('./logger')
var pool

/**
 * Workers manages a worker pool. You should probably use this via the
 * AsyncCrypto interface.
 *
 * TODO: Perhaps we should merge this and AsyncCrypto? All we need is a
 * convenient interface for doing computationally intense operations, and
 * automatically manage a default global worker pool. Workers does exactly
 * that. AsyncCrypto may be entirely redundant.
 */
function Workers () {
  if (!(this instanceof Workers)) {
    return new Workers()
  }
  if (!pool) {
    if (!process.browser) {
      pool = workerpool.pool(__dirname + '/worker.js')
    } else {
      pool = workerpool.pool(process.env.DATT_NODE_JS_BASE_URL + process.env.DATT_NODE_JS_WORKER_FILE)
    }
  }
}

/**
 * The sha256 hash (buffer) of data (buffer). Note that we convert the data to
 * hex and transmit this to the worker. That is not efficient. TODO: For speed,
 * rewrite tranmission to copy (node) or transfer (browser) a buffer rather
 * than a hex string.
 */
Workers.prototype.sha256 = function sha256 (databuf) {
  var datahex = databuf.toString('hex')
  return q(pool.exec('sha256', [datahex])).then(function (hashhex) {
    return new Buffer(hashhex, 'hex')
  })
}

/**
 * Derive a publicKey object from a privateKey object in a worker. TODO: For
 * speed, rewrite transmission code to copy/transfer the buffer form of the
 * privateKey to the worker and to send back the buffer form of the publicKey,
 * rather than copying JSON data.
 */
Workers.prototype.publicKeyFromPrivateKey = function (privateKey) {
  var privateKeyObject = privateKey.toObject()
  return q(pool.exec('publicKeyHexFromPrivateKeyObject', [privateKeyObject])).then(function (publicKeyHex) {
    var publicKey = new bitcore.PublicKey(publicKeyHex, {
      compressed: privateKey.compressed,
      network: privateKey.network
    })
    return publicKey
  })
}

/**
 * Derive an address from a public key in a worker. TODO: For speed, replace transmission
 * code with buffers rather than JSON.
 */
Workers.prototype.addressFromPublicKey = function (publicKey) {
  var publicKeyHex = publicKey.toBuffer('hex')
  return q(pool.exec('addressHexFromPublicKeyHex', [publicKeyHex])).then(function (addressHex) {
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
Workers.prototype.xkeysFromSeed = function (seedbuf) {
  var seedhex = seedbuf.toString('hex')
  return q(pool.exec('xkeysFromSeedHex', [seedhex])).then(function (obj) {
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
Workers.prototype.deriveXkeysFromXprv = function (xprv, path) {
  var xprvobj = xprv.toObject()
  return q(pool.exec('deriveXkeysFromXprvObject', [xprvobj, path])).then(function (obj) {
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
Workers.prototype.sign = function (hash, privateKey, endian) {
  var hashhex = hash.toString('hex')
  var privateKeyHex = privateKey.toBuffer().toString('hex')
  return q(pool.exec('sign', [hashhex, privateKeyHex, endian])).then(function (sighex) {
    return bitcore.crypto.Signature.fromBuffer(new Buffer(sighex, 'hex'))
  })
}

/**
 * Use ECDSA to verify if the signature is valid, i.e. it corresponds to the
 * hash and public key. TODO: Send buffers instead of hex/JSON.
 */
Workers.prototype.verifySignature = function (hash, signature, publicKey) {
  if (!hash || !signature || !publicKey) {
    return q.reject(new Error('Workers#verifySignature needs 3 non-null, defined arguments: hash, signature, and publicKey'))
  }
  try {
    var hashhex = hash.toString('hex')
    var publicKeyHex = publicKey.toBuffer().toString('hex')
    var signatureHex = signature.toBuffer().toString('hex')

    return q(pool.exec('verifySignature', [hashhex, signatureHex, publicKeyHex]))
  } catch (exc) {
    logger.debug(exc)
    logger.debug(exc.stack)
    return q.reject(exc)
  }
}

module.exports = Workers
