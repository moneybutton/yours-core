var workerpool = require('workerpool')
var bitcore = require('bitcore')

function sha256 (datahex) {
  var buf = new Buffer(datahex, 'hex')
  return bitcore.crypto.Hash.sha256(buf).toString('hex')
}

function publicKeyHexFromPrivateKeyWIF (privateKeyWIF) {
  var privateKey = bitcore.PrivateKey.fromWIF(privateKeyWIF)
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
  publicKeyHexFromPrivateKeyWIF: publicKeyHexFromPrivateKeyWIF,
  addressHexFromPublicKeyHex: addressHexFromPublicKeyHex,
  sign: sign
})
