/* global fullnode */
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
let Address = fullnode.Address
let BIP32 = fullnode.BIP32
let BIP39 = fullnode.BIP39
let BSM = fullnode.BSM
let ECDSA = fullnode.ECDSA
let Hash = fullnode.Hash
let Keypair = fullnode.Keypair
let Pubkey = fullnode.Pubkey
let Struct = fullnode.Struct
let asink = require('asink')

function CryptoWorkers () {
  if (!(this instanceof CryptoWorkers)) {
    return new CryptoWorkers()
  }
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
  return Hash.asyncSha256(databuf)
}

/**
 * For signing data, we don't want to just use the sha256 hash like bitcoin so
 * that we are not tricked into signing a transaction that spends bitcoin. It
 * is safer to use the Bitcoin Signed Message hashing method which prepends the
 * data with a prefix that makes it basically impossible to accidentally sign a
 * transaction. TODO: For speed, rewrite tranmission to copy (node) or transfer
 * (browser) a buffer rather than a hex string.
 */
CryptoWorkers.prototype.asyncBSMHash = function BSMHash (databuf) {
  return BSM.asyncMagicHash(databuf)
}

/**
 * Derive a pubkey object from a privkey object in a worker. TODO: For
 * speed, rewrite transmission code to copy/transfer the buffer form of the
 * privkey to the worker and to send back the buffer form of the pubkey,
 * rather than copying JSON data.
 */
CryptoWorkers.prototype.asyncPubkeyFromPrivkey = function (privkey) {
  return Pubkey().asyncFromPrivkey(privkey)
}

CryptoWorkers.prototype.asyncAddressFromPubkeyBuffer = function (pubkeybuf) {
  return asink(function *() {
    let pubkey = yield Pubkey().asyncFromBuffer(pubkeybuf)
    return Address().asyncFromPubkey(pubkey)
  }, this)
}

/**
 * Derive an address from a public key in a worker. TODO: For speed, replace
 * transmission code with buffers rather than JSON.
 */
CryptoWorkers.prototype.asyncAddressFromPubkey = function (pubkey) {
  return Address().asyncFromPubkey(pubkey)
}

/**
 * Derive an address object from an address string.
 */
CryptoWorkers.prototype.asyncAddressFromAddressString = function (addressString) {
  return Address().asyncFromString(addressString)
}

/**
 * Derive the base58 string representation of an address. TODO: For speed,
 * replace transmission code with buffers rather than JSON.
 */
CryptoWorkers.prototype.asyncAddressStringFromAddress = function (address) {
  return address.asyncToString()
}

/**
 * Derive the xprv, xpub and mnemonic from an entropy buffer. That is, given
 * some random data of 128 bits, derive the extended private key and extended
 * public key from that entropy. TODO: Instead of sending hex or JSON to/from
 * the worker, send buffers to/from.
 */
CryptoWorkers.prototype.asyncXkeysFromEntropy = function (entropybuf) {
  return asink(function *() {
    let bip39 = yield BIP39().asyncFromEntropy(entropybuf)
    let seed = yield bip39.asyncToSeed()
    let bip32 = yield BIP32().asyncFromSeed(seed)
    let mnemonic = bip39.toString()
    let xprv = bip32
    let xpub = bip32.toPublic()
    return {
      mnemonic: mnemonic,
      xprv: xprv,
      xpub: xpub
    }
  }, this)
}

/**
 * Given an xprv (extended private key), derive the path to a new xprv and its
 * corresponding xpub and address (see BIP 32). TODO: Send buffers instead of
 * hex/JSON.
 */
CryptoWorkers.prototype.asyncDeriveXkeysFromXprv = function (xprv, path) {
  return asink(function *() {
    let xprv2 = yield xprv.asyncDerive(path)
    let xpub = xprv2.toPublic()
    let address = yield Address().asyncFromPubkey(xprv2.pubkey)
    return {xprv: xprv2, xpub, address}
  }, this)
}

/**
 * Given an xpub (extended public key), derive the path to a new xpub and its
 * corresponding xpub and address (see BIP 32). TODO: Send buffers instead of
 * hex/JSON.
 */
CryptoWorkers.prototype.asyncDeriveXkeysFromXpub = function (xpub, path) {
  return asink(function *() {
    xpub = yield xpub.asyncDerive(path)
    let address = yield Address().asyncFromPubkey(xpub.pubkey)
    return {xpub, address}
  }, this)
}

/**
 * Given a hash (32 byte buffer), privkey, and endian (either 'little' or
 * 'big', default 'big'), compute the Signature (using ECDSA). Returns a
 * fullnode Signature object. TODO: Send buffers instead of hex/JSON.
 */
CryptoWorkers.prototype.asyncSign = function (hash, privkey, endian) {
  return asink(function *() {
    let pubkey = yield Pubkey().asyncFromPrivkey(privkey)
    let keypair = Keypair(privkey, pubkey)
    let sig = yield ECDSA.asyncSign(hash, keypair, endian)
    return sig
  }, this)
}

/**
 * Compute the compact signature, which includes the "recovery" and
 * "compressed" properties that allow the signature to be converted into a
 * compact binary format.
 */
CryptoWorkers.prototype.asyncSignCompact = function (hashbuf, privkey) {
  return asink(function *() {
    let pubkey = yield Pubkey().asyncFromPrivkey(privkey)
    let keypair = Keypair(privkey, pubkey)
    let sig = yield ECDSA.asyncSign(hashbuf, keypair)
    sig = yield ECDSA.asyncCalcrecovery(sig, pubkey, hashbuf)
    return sig
  }, this)
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
    let verified = yield ECDSA.asyncVerify(hash, signature, pubkey)
    return verified
  }, this)
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
    let pubkey
    let verified = false
    try {
      pubkey = yield ECDSA.asyncSig2pubkey(sig, hashbuf)
      verified = yield ECDSA.asyncVerify(hashbuf, sig, pubkey)
    } catch (err) {
      pubkey = undefined
    }
    return {verified, pubkey}
  }, this)
}

/**
 * txb must be a Txbuilder object that is *built*, i.e. you have run .build()
 * on it, and it contains a transaction. The transaction has everything but the
 * signatures. privkeys must be an array of Privkey objects where each privkey
 * is the private key of the corresponding input on the transaction. i.e.,
 * txb.tx.txins[0] requires the signature corresponding to privkeys[0],
 * txb.tx.txins[1] requires privkeys[1], and so on.
 */
CryptoWorkers.prototype.asyncSignTransaction = function (txb, privkeys) {
  return asink(function *() {
    let keypairs = []
    for (let i = 0; i < privkeys.length; i++) {
      let privkey = privkeys[i]
      let pubkey = yield Pubkey().asyncFromPrivkey(privkey)
      keypairs[i] = yield Keypair(privkey, pubkey)
    }
    if (txb.txins.length !== keypairs.length) {
      throw new Error('number of inputs and number of privkeys do not match')
    }
    for (let i = 0; i < keypairs.length; i++) {
      yield txb.asyncSign(i, keypairs[i])
    }
    return txb
  }, this)
}

let cryptoWorkers = new CryptoWorkers()
for (let method in CryptoWorkers.prototype) {
  // This javascript wizardry makes it possible to use methods like
  // CryptoWorkers.asyncSha256 that will re-use the same global cryptoWorkers object for
  // convenience
  CryptoWorkers[method] = CryptoWorkers.prototype[method].bind(cryptoWorkers)
}

module.exports = CryptoWorkers
