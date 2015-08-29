/**
 * AsyncCrypto is a module for doing cryptography with an asynchronous
 * interface with web workers (browser) or child process forks (node). It uses
 * the workerpool module to automatically manage the workers with an interface
 * isomorphic between node and a browser (i.e., it works in both).
 */
var Workers = require('./workers')
var workers = false
var asyncCrypto

function AsyncCrypto () {
  if (!(this instanceof AsyncCrypto)) {
    return new AsyncCrypto()
  }
  if (!workers) {
    // cache global workers, so if you create
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

asyncCrypto = new AsyncCrypto()
for (var method in AsyncCrypto.prototype) {
  // This javascript wizardry makes it possible to use methods like
  // AsyncCrypto.sha256 that will re-use the same global asyncCrypto object for
  // convenience
  AsyncCrypto[method] = AsyncCrypto.prototype[method].bind(asyncCrypto)
}

module.exports = AsyncCrypto
