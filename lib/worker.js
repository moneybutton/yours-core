/* global importScripts,self */
var Privkey = require('fullnode/lib/privkey')
var Pubkey = require('fullnode/lib/pubkey')
var BIP32 = require('fullnode/lib/bip32')
var BIP39 = require('fullnode/lib/bip39')
var Hash = require('fullnode/lib/hash')
var Address = require('fullnode/lib/address')
var Keypair = require('fullnode/lib/keypair')
var ECDSA = require('fullnode/lib/ecdsa')
var Sig = require('fullnode/lib/sig')

if (typeof importScripts === 'function') {
  var workerpoolfile = process.env.DATT_JS_BASE_URL + process.env.DATT_CORE_JS_WORKERPOOL_FILE
  importScripts(workerpoolfile)
} else {
  var workerpool = require('workerpool')
}

function sha256 (datahex) {
  var buf = new Buffer(datahex, 'hex')
  return Hash.sha256(buf).toString('hex')
}

function pubkeyHexFromPrivkeyHex (privkeyHex) {
  var privkey = Privkey().fromHex(privkeyHex)
  return Pubkey().fromPrivkey(privkey).toHex()
}

function addressHexFromPubkeyHex (pubkeyHex) {
  var pubkey = Pubkey().fromHex(pubkeyHex)
  return Address().fromPubkey(pubkey).toHex()
}

function xkeysFromEntropyHex (entropyhex) {
  var entropybuf = new Buffer(entropyhex, 'hex')
  var bip39 = BIP39().fromEntropy(entropybuf)
  var xprv = BIP32().fromSeed(bip39.toSeed())
  var xpub = xprv.toPublic()
  return {
    mnemonic: bip39.toString(),
    xprv: xprv.toHex(),
    xpub: xpub.toHex()
  }
}

function deriveXkeysFromXprvHex (xprvhex, path) {
  var xprv = BIP32().fromHex(xprvhex)
  xprv = xprv.derive(path)
  var xpub = xprv.toPublic()
  var address = Address().fromPubkey(xpub.pubkey)
  return {
    xprv: xprv.toHex(),
    xpub: xpub.toHex(),
    address: address.toHex()
  }
}

function sign (hashhex, privkeyHex, endian) {
  var hash = new Buffer(hashhex, 'hex')
  var privkey = Privkey().fromHex(privkeyHex)
  var keypair = Keypair().fromPrivkey(privkey)
  return ECDSA.sign(hash, keypair, endian).toString('hex')
}

function verifySignature (hashhex, signatureHex, pubkeyHex) {
  var hash = new Buffer(hashhex, 'hex')
  try {
    var pubkey = Pubkey().fromHex(pubkeyHex)
    var signature = Sig().fromHex(signatureHex)
    return ECDSA.verify(hash, signature, pubkey)
  } catch (exc) {
    console.error(exc)
    console.error(exc.stack)
    throw exc
  }
}

var f = {
  sha256: sha256,
  pubkeyHexFromPrivkeyHex: pubkeyHexFromPrivkeyHex,
  addressHexFromPubkeyHex: addressHexFromPubkeyHex,
  xkeysFromEntropyHex: xkeysFromEntropyHex,
  deriveXkeysFromXprvHex: deriveXkeysFromXprvHex,
  sign: sign,
  verifySignature: verifySignature
}

if (workerpool) {
  // node
  workerpool.worker(f)
} else {
  // browser
  self.workerpool.worker(f)
}
