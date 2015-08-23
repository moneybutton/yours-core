var bitcore = require('bitcore')
var q = require('q')
var workerpool = require('workerpool')

var pool

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

Workers.prototype.sha256 = function sha256 (databuf) {
  var datahex = databuf.toString('hex')
  return q(pool.exec('sha256', [datahex])).then(function (hashhex) {
    return new Buffer(hashhex, 'hex')
  })
}

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
