/* global importScripts,self */
var bitcore = require('bitcore')

if (typeof importScripts === 'function') {
  var workerpoolfile = process.env.DATT_NODE_JS_BASE_URL + process.env.DATT_NODE_JS_WORKERPOOL_FILE
  importScripts(workerpoolfile)
} else {
  var workerpool = require('workerpool')
}

function sha256 (datahex) {
  var buf = new Buffer(datahex, 'hex')
  return bitcore.crypto.Hash.sha256(buf).toString('hex')
}

function publicKeyHexFromPrivateKeyObject (privateKeyObject) {
  var privateKey = bitcore.PrivateKey.fromObject(privateKeyObject)
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

function verifySignature (hashhex, signatureHex, publicKeyHex) {
  var hash = new Buffer(hashhex, 'hex')
  try {
    var publicKey = bitcore.PublicKey.fromBuffer(new Buffer(publicKeyHex, 'hex'))
    var signature = bitcore.crypto.Signature.fromBuffer(new Buffer(signatureHex, 'hex'))
    return bitcore.crypto.ECDSA.verify(hash, signature, publicKey)
  } catch (exc) {
    console.error(exc)
    console.error(exc.stack)
    throw exc
  }
}

var f = {
  sha256: sha256,
  publicKeyHexFromPrivateKeyObject: publicKeyHexFromPrivateKeyObject,
  addressHexFromPublicKeyHex: addressHexFromPublicKeyHex,
  sign: sign,
  verifySignature: verifySignature
}

if (workerpool) {
  // node
  workerpool.worker(f)
} else {
  // browserj
  self.workerpool.worker(f)
}
