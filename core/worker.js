/* global importScripts,self */
'use strict'
let Address = require('fullnode').Address
let BIP32 = require('fullnode').BIP32
let BIP39 = require('fullnode').BIP39
let BSM = require('fullnode').BSM
let ECDSA = require('fullnode').ECDSA
let Hash = require('fullnode').Hash
let Keypair = require('fullnode').Keypair
let Privkey = require('fullnode').Privkey
let Pubkey = require('fullnode').Pubkey
let Sig = require('fullnode').Sig
let Txbuilder = require('fullnode').Txbuilder

function sha256 (datahex) {
  let buf = new Buffer(datahex, 'hex')
  return Hash.sha256(buf).toString('hex')
}

function BSMHash (datahex) {
  let buf = new Buffer(datahex, 'hex')
  return BSM.magicHash(buf)
}

function pubkeyHexFromPrivkeyHex (privkeyHex) {
  let privkey = Privkey().fromHex(privkeyHex)
  return Pubkey().fromPrivkey(privkey).toFastBuffer().toString('hex')
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
    pubkey: pubkey.toFastBuffer().toString('hex')
  }
}

function signTransaction (txbjson, privkeys) {
  let txb = Txbuilder().fromJSON(txbjson)
  privkeys = privkeys.map((privkey) => Privkey().fromHex(privkey))
  let keypairs = privkeys.map((privkey) => Keypair().fromPrivkey(privkey))
  if (txb.txins.length !== keypairs.length) {
    throw new Error('number of inputs and number of privkeys do not match')
  }
  for (let i = 0; i < keypairs.length; i++) {
    txb.sign(i, keypairs[i])
  }
  return txb.toJSON()
}

let f = {
  sha256,
  BSMHash,
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
  verifyCompactSig,
  signTransaction
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
