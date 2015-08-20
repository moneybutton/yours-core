/**
 * AsyncCrypto is a module for doing cryptography with an asynchronous
 * interface with web workers or child process forks. It does not actually
 * support web workers or child process forks yet, but it is designed so that
 * we can start putting the cryptography behind a common, asynchronous
 * interface that can be updated to use web workers and child process forks at
 * a later date.
 *
 * TODO: The way to integrate web workers is as follows. Declare a separate
 * "worker" class that manages the workers, i.e., it can spawn new workers, and
 * respawn them if they crash, and shut them down if necessary. If this worker
 * class has not already been initialized, then we initialize it. Otherwise,
 * use the already initialized worker class.
 */
var bitcore = require('bitcore')
var Mnemonic = require('bitcore-mnemonic')
var q = require('q')
var Workers = require('./workers')

var workers = false

function AsyncCrypto () {
  if (!(this instanceof AsyncCrypto))
    return new AsyncCrypto()
  if (!workers) {
    workers = Workers()
    this.workers = workers
  }
  this.workers = workers
}

AsyncCrypto.prototype.sha256 = function sha256 (databuf) {
  return workers.sha256(databuf)
}

AsyncCrypto.prototype.PublicKeyFromPrivateKey = function (privateKey) {
  return workers.publicKeyFromPrivateKey(privateKey)
}

AsyncCrypto.prototype.AddressFromPublicKey = function (publicKey) {
  return workers.addressFromPublicKey(publicKey)
}

AsyncCrypto.prototype.sign = function (hash, privateKey, endian) {
  return workers.sign(hash, privateKey, endian)
}

module.exports = AsyncCrypto
