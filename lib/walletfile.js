var assert = require('assert')
var bitcore = require('bitcore')
var AsyncCrypto = require('./asynccrypto')

/**
 * The "wallet file" contains a user's master extended private key
 * (masterxprv), as well as other wallet-related meta data. Some of this data
 * may also be stored in a database, but the idea is that the user's "money" is
 * contained and can be exported in this file. The most important part is their
 * mnemonic, which is a series of words (following BIP 39) that can be used to
 * derive all their addresses. So long as they back up that mnemonic, they can
 * recover their funds. However, the wallet will contain other meta data,
 * perhaps transaction descriptions, that cannot be recovered from the
 * mnemonic.
 */
function WalletFile (mnemonic, masterxprv, masterxpub) {
  if (!(this instanceof WalletFile)) {
    return new WalletFile(mnemonic, masterxprv, masterxpub)
  }
  this.mnemonic = mnemonic
  this.masterxprv = masterxprv
  this.masterxpub = masterxpub
}

/**
 * Generate a new wallet file from cryptographically random entropy.
 */
WalletFile.fromRandom = function fromRandom () {
  // 128 bit buffers produce 12-word mnemonics, which are both secure and
  // relatively easy to remember (compared to 256-bit/24-word mnemonics)
  var randbuf = bitcore.crypto.Random.getRandomBuffer(128 / 8)
  return WalletFile.fromSeed(randbuf)
}

/**
 * Generate a new wallet from a random "seed", which must be exactly 128 bits.
 */
WalletFile.fromSeed = function fromSeed (seedbuf) {
  return AsyncCrypto.xkeysFromSeed(seedbuf).then(function (obj) {
    var walletfile = new WalletFile(obj.mnemonic, obj.xprv, obj.xpub)
    return walletfile
  })
}

/**
 * Derive the "xkeys", which is a new xprv, xpub and address, from a BIP 32
 * path. This follows the convention of BIP 44, which specifies the meaning of
 * "account", "change" and "index".
 */
WalletFile.prototype.deriveBIP44Xkeys = function (account, change, index) {
  assert(typeof account === 'number')
  assert(typeof change === 'number')
  assert(typeof index === 'number')
  var path = "m/44'/0'/" + account + "'/" + change + '/' + index
  return AsyncCrypto.deriveXkeysFromXprv(this.masterxprv, path)
}

WalletFile.fromJSON = function fromJSON (json) {}

WalletFile.prototype.toJSON = function () {}

module.exports = WalletFile
