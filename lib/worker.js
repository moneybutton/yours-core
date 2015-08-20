/* global importScripts */
var bitcore = require('bitcore')

if (typeof importScripts === 'function') {
  importScripts(process.env.DATT_JS_BASE_URL + '/' + process.env.DATT_WORKERPOOL)
} else {
  var workerpool = require('workerpool')
}

function sha256 (datahex) {
  var buf = new Buffer(datahex, 'hex')
  return bitcore.crypto.Hash.sha256(buf).toString('hex')
}

function publicKeyHexFromPrivateKeyJSON (privateKeyJSON) {
  var privateKey = bitcore.PrivateKey.fromJSON(privateKeyJSON)
  return privateKey.toPublicKey().toBuffer().toString('hex')
}

function addressHexFromPublicKeyHex (publicKeyHex) {
  var buf = new Buffer(publicKeyHex, 'hex')
  var publicKey = bitcore.PublicKey.fromBuffer(buf)
  return publicKey.toAddress().toBuffer().toString('hex')
}

function sign (hashhex, privateKeyHex, endian) {
  var hash = new Buffer(hashhex, 'hex')
  var privateKey = bitcore.PrivateKey.fromBuffer(new Buffer(privateKeyHex, 'hex'))
  return bitcore.crypto.ECDSA.sign(hash, privateKey, endian).toString('hex')
}

workerpool.worker({
  sha256: sha256,
  publicKeyHexFromPrivateKeyJSON: publicKeyHexFromPrivateKeyJSON,
  addressHexFromPublicKeyHex: addressHexFromPublicKeyHex,
  sign: sign
})
