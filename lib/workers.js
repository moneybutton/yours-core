var bitcore = require('bitcore')
var q = require('q')
var workerpool = require('workerpool')

var pool

function Workers () {
  if (!(this instanceof Workers))
    return new Workers()
  if (!pool)
    pool = workerpool.pool(__dirname + '/worker.js')
}

Workers.prototype.sha256 = function sha256 (databuf) {
  var datahex = databuf.toString('hex')
  return q(pool.exec('sha256', [datahex])).then(function (hashhex) {
    return new Buffer(hashhex, 'hex')
  })
}

Workers.prototype.publicKeyFromPrivateKey = function (privateKey) {
  var privateKeyWIF = privateKey.toWIF()
  return q(pool.exec('publicKeyHexFromPrivateKeyWIF', [privateKeyWIF])).then(function (publicKeyHex) {
    var publicKey = bitcore.PublicKey.fromBuffer(new Buffer(publicKeyHex, 'hex'))
    return publicKey
  })
}

Workers.prototype.addressFromPublicKey = function (publicKey) {
  var publicKeyHex = publicKey.toBuffer('hex')
  return q(pool.exec('addressHexFromPublicKeyHex', [publicKeyHex])).then(function (addressHex) {
    return bitcore.Address.fromBuffer(new Buffer(addressHex, 'hex'))
  })
}

Workers.prototype.sign = function (hash, privateKey, endian) {
  var hashhex = hash.toString('hex')
  var privateKeyHex = privateKey.toBuffer().toString('hex')
  return q(pool.exec('sign', [hashhex, privateKeyHex, endian])).then(function (sighex) {
    return bitcore.crypto.Signature.fromBuffer(new Buffer(sighex, 'hex'))
  })
}

module.exports = Workers
