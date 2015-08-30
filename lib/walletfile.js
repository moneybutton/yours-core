var assert = require('assert')
var bitcore = require('bitcore')
var AsyncCrypto = require('./asynccrypto')

function WalletFile (mnemonic, masterxprv, masterxpub) {
  if (!(this instanceof WalletFile)) {
    return new WalletFile(mnemonic, masterxprv, masterxpub)
  }
  this.mnemonic = mnemonic
  this.masterxprv = masterxprv
  this.masterxpub = masterxpub
}

WalletFile.fromRandom = function fromRandom () {
  // 128 bit buffers produce 12-word mnemonics, which are both secure and
  // relatively easy to remember (compared to 256-bit/24-word mnemonics)
  var randbuf = bitcore.crypto.Random.getRandomBuffer(128 / 8)
  return WalletFile.fromSeed(randbuf)
}

WalletFile.fromSeed = function fromSeed (seedbuf) {
  return AsyncCrypto.xkeysFromSeed(seedbuf).then(function (obj) {
    var walletfile = new WalletFile(obj.mnemonic, obj.xprv, obj.xpub)
    return walletfile
  })
}

WalletFile.prototype.deriveBIP44Xkeys = function (account, change, index) {
  assert(typeof account === 'number')
  assert(typeof change === 'number')
  assert(typeof index === 'number')
  var path = "m/44'/0'/" + account + "'/" + change + "/" + index
  return AsyncCrypto.deriveXkeysFromXprv(this.masterxprv, path)
}

WalletFile.fromJSON = function fromJSON (json) {}

WalletFile.prototype.toJSON = function () {}

module.exports = WalletFile
