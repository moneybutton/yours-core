/* global importScripts,self */
'use strict'
let Privkey = require('fullnode/lib/privkey')
let Pubkey = require('fullnode/lib/pubkey')
let BIP32 = require('fullnode/lib/bip32')
let BIP39 = require('fullnode/lib/bip39')
let Hash = require('fullnode/lib/hash')
let Address = require('fullnode/lib/address')
let Keypair = require('fullnode/lib/keypair')
let ECDSA = require('fullnode/lib/ecdsa')
let Sig = require('fullnode/lib/sig')

function sha256 (datahex) {
  let buf = new Buffer(datahex, 'hex')
  return Hash.sha256(buf).toString('hex')
}

function pubkeyHexFromPrivkeyHex (privkeyHex) {
  let privkey = Privkey().fromHex(privkeyHex)
  return Pubkey().fromPrivkey(privkey).toDER(false).toString('hex')
}

function addressHexFromPubkeyHex (pubkeyHex) {
  let pubkey = Pubkey().fromHex(pubkeyHex)
  return Address().fromPubkey(pubkey).toHex()
}

function addressHexFromAddressString (addressString) {
  let address = Address().fromString(addressString)
  return address.toHex()
}

function addressStringFromAddressHex (addressHex) {
  let address = Address().fromHex(addressHex)
  return address.toString()
}

function xkeysFromEntropyHex (entropyhex) {
  let entropybuf = new Buffer(entropyhex, 'hex')
  let bip39 = BIP39().fromEntropy(entropybuf)
  let xprv = BIP32().fromSeed(bip39.toSeed())
  let xpub = xprv.toPublic()
  return {
    mnemonic: bip39.toString(),
    xprv: xprv.toHex(),
    xpub: xpub.toHex()
  }
}

function deriveXkeysFromXprvHex (xprvhex, path) {
  let xprv = BIP32().fromHex(xprvhex)
  xprv = xprv.derive(path)
  let xpub = xprv.toPublic()
  let address = Address().fromPubkey(xpub.pubkey)
  return {
    xprv: xprv.toHex(),
    xpub: xpub.toHex(),
    address: address.toHex()
  }
}

function deriveXkeysFromXpubHex (xpubhex, path) {
  let xpub = BIP32().fromHex(xpubhex)
  xpub = xpub.derive(path)
  let address = Address().fromPubkey(xpub.pubkey)
  return {
    xpub: xpub.toHex(),
    address: address.toHex()
  }
}

function sign (hashhex, privkeyHex, endian) {
  let hash = new Buffer(hashhex, 'hex')
  let privkey = Privkey().fromHex(privkeyHex)
  let keypair = Keypair().fromPrivkey(privkey)
  return ECDSA.sign(hash, keypair, endian).toString('hex')
}

function signCompact (hashhex, privkeyHex) {
  let hashbuf = new Buffer(hashhex, 'hex')
  let privkey = Privkey().fromHex(privkeyHex)
  let keypair = Keypair().fromPrivkey(privkey)
  let sig = ECDSA.sign(hashbuf, keypair)
  sig = ECDSA.calcrecovery(sig, keypair.pubkey, hashbuf)
  return sig.toCompact().toString('hex')
}

function verifySignature (hashhex, signatureHex, pubkeyHex) {
  let hash = new Buffer(hashhex, 'hex')
  let pubkey = Pubkey().fromHex(pubkeyHex)
  let signature = Sig().fromHex(signatureHex)
  return ECDSA.verify(hash, signature, pubkey)
}

function verifyCompactSig (hashhex, signatureHex) {
  let hashbuf = new Buffer(hashhex, 'hex')
  let sig = Sig().fromCompact(new Buffer(signatureHex, 'hex'))
  let pubkey
  try {
    pubkey = ECDSA.sig2pubkey(sig, hashbuf)
  } catch (err) {
    return {
      verified: false
    }
  }
  return {
    verified: ECDSA.verify(hashbuf, sig, pubkey),
    pubkey: pubkey.toDER(false).toString('hex')
  }
}

let f = {
  sha256,
  pubkeyHexFromPrivkeyHex,
  addressHexFromPubkeyHex,
  addressHexFromAddressString,
  addressStringFromAddressHex,
  xkeysFromEntropyHex,
  deriveXkeysFromXprvHex,
  deriveXkeysFromXpubHex,
  sign,
  signCompact,
  verifySignature,
  verifyCompactSig
}

let workerpool

if (process.browser) {
  let workerpoolfile = process.env.DATT_JS_BASE_URL + process.env.DATT_CORE_JS_WORKERPOOL_FILE
  importScripts(workerpoolfile)
} else {
  workerpool = require('workerpool')
}

if (workerpool) {
  // node
  workerpool.worker(f)
} else {
  // browser
  self.workerpool.worker(f)
}
