/* global it,describe */
'use strict'
let Address = require('fullnode/lib/address')
let BIP32 = require('fullnode/lib/bip32')
let BN = require('fullnode/lib/bn')
let CryptoWorkers = require('../../core/crypto-workers')
let ECDSA = require('fullnode/lib/ecdsa')
let Hash = require('fullnode/lib/hash')
let Interp = require('fullnode/lib/interp')
let Keypair = require('fullnode/lib/keypair')
let Privkey = require('fullnode/lib/privkey')
let Pubkey = require('fullnode/lib/pubkey')
let Script = require('fullnode/lib/script')
let Txbuilder = require('fullnode/lib/txbuilder')
let Txout = require('fullnode/lib/txout')
let Txverifier = require('fullnode/lib/txverifier')
let asink = require('asink')
let should = require('should')
let workerpool = require('workerpool')

describe('CryptoWorkers', function () {
  let databuf = new Buffer(50)
  databuf.fill(0)
  let hashbuf = Hash.sha256(databuf)

  describe('CryptoWorkers', function () {
    it('should exist', function () {
      should.exist(CryptoWorkers)
      should.exist(CryptoWorkers.asyncSha256)
      should.exist(CryptoWorkers.asyncPubkeyFromPrivkey)
      should.exist(CryptoWorkers.asyncAddressFromPubkey)
      should.exist(CryptoWorkers.asyncSign)
      let cryptoWorkers = new CryptoWorkers()
      should.exist(cryptoWorkers)
      should.exist(cryptoWorkers.asyncSha256)
      should.exist(cryptoWorkers.asyncPubkeyFromPrivkey)
      should.exist(cryptoWorkers.asyncAddressFromPubkey)
      should.exist(cryptoWorkers.asyncSign)
    })

    it('should share the same default worker pool', function () {
      let cryptoWorkers = new CryptoWorkers()
      let cryptoWorkers2 = new CryptoWorkers()
      cryptoWorkers2.pool.should.equal(cryptoWorkers.pool)

      let pool
      if (!process.browser) {
        pool = workerpool.pool(__dirname + '/worker.js')
      } else {
        pool = workerpool.pool(process.env.DATT_JS_BASE_URL + process.env.DATT_CORE_JS_WORKER_FILE)
      }
      let cryptoWorkers3 = new CryptoWorkers(pool)
      cryptoWorkers3.pool.should.not.equal(cryptoWorkers.pool)
      cryptoWorkers3.pool.should.equal(pool)
    })
  })

  describe('@asyncSha256', function () {
    it('should compute the same as fullnode', function () {
      return asink(function *() {
        let buf = yield CryptoWorkers.asyncSha256(databuf)
        buf.compare(Hash.sha256(databuf)).should.equal(0)
      })
    })
  })

  describe('@asyncPubkeyFromPrivkey', function () {
    it('should compute the same as fullnode', function () {
      return asink(function *() {
        let privkey = Privkey().fromRandom()
        let pubkey = yield CryptoWorkers.asyncPubkeyFromPrivkey(privkey)
        pubkey.toString().should.equal(Pubkey().fromPrivkey(privkey).toString())
      })
    })
  })

  describe('@asyncAddressFromPubkey', function () {
    it('should compute the same as fullnode', function () {
      return asink(function *() {
        let privkey = Privkey().fromRandom()
        let pubkey = Pubkey().fromPrivkey(privkey)
        let address = yield CryptoWorkers.asyncAddressFromPubkey(pubkey)
        address.toString().should.equal(Address().fromPubkey(pubkey).toString())
      })
    })
  })

  describe('@asyncAddressFromAddressString', function () {
    it('should compute the same as fullnode', function () {
      return asink(function *() {
        let privkey = Privkey().fromRandom()
        let pubkey = Pubkey().fromPrivkey(privkey)
        let address = yield CryptoWorkers.asyncAddressFromPubkey(pubkey)
        let address2 = yield CryptoWorkers.asyncAddressFromAddressString(address.toString())
        address.toString().should.equal(address2.toString())
      })
    })
  })

  describe('@asyncAddressStringFromAddress', function () {
    it('should convert an address into a base58 string', function () {
      return asink(function *() {
        let privkey = Privkey().fromRandom()
        let pubkey = Pubkey().fromPrivkey(privkey)
        let address = yield CryptoWorkers.asyncAddressFromPubkey(pubkey)
        let addressString = yield CryptoWorkers.asyncAddressStringFromAddress(address)
        address.toString().should.equal(addressString)
      })
    })
  })

  describe('@asyncXkeysFromEntropy', function () {
    it('should derive new mnemonic, xprv, xpub', function () {
      return asink(function *() {
        let seedbuf = new Buffer(128 / 8)
        seedbuf.fill(0)
        let obj = yield CryptoWorkers.asyncXkeysFromEntropy(seedbuf)
        obj.mnemonic.should.equal('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')
        obj.xprv.toString().should.equal('xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu')
        obj.xpub.toString().should.equal('xpub661MyMwAqRbcFkPHucMnrGNzDwb6teAX1RbKQmqtEF8kK3Z7LZ59qafCjB9eCRLiTVG3uxBxgKvRgbubRhqSKXnGGb1aoaqLrpMBDrVxga8')
      })
    })
  })

  describe('@asyncDeriveXkeysFromXprv', function () {
    it('should derive new xprv, xpub, address', function () {
      return asink(function *() {
        let seedbuf = new Buffer(128 / 8)
        seedbuf.fill(0)
        let xprv = BIP32().fromSeed(seedbuf)
        let path = "m/44'/0'/0'/0/0"
        let obj = yield CryptoWorkers.asyncDeriveXkeysFromXprv(xprv, path)
        obj.xprv.toString().should.equal('xprvA4EMaq49eKGKGK2k3kAsiqTowWrNuidQTx5DaYm669TjJUtsEARurRTwXiP1PXsNkxL4pLijwktqb9gSWHccdm92nKDKznNUCSKwvktQLp2')
        obj.xpub.toString().should.equal('xpub6HDhzLb3UgpcUo7D9mht5yQYVYgsKBMFqAzpNwAheUziBHE1mhkAQDnRNyTArZsiyczWpmchy1H6nEzCeLpa7Xm5BGxpbHRP2dKKUR3puTv')
        obj.address.toString().should.equal('1CwgwxqUVapWbgk6ssLruv9eHxHe6LvCe6')
      })
    })
  })

  describe('@asyncDeriveXkeysFromXpub', function () {
    it('should derive new xpub and address', function () {
      return asink(function *() {
        let seedbuf = new Buffer(128 / 8)
        seedbuf.fill(0)
        let xprv = BIP32().fromSeed(seedbuf)
        let path = "m/44'/0'/0'"
        let obj = yield CryptoWorkers.asyncDeriveXkeysFromXprv(xprv, path)
        let xpub = obj.xpub
        path = 'm/0/0'
        obj = yield CryptoWorkers.asyncDeriveXkeysFromXpub(xpub, path)
        obj.xpub.toString().should.equal('xpub6HDhzLb3UgpcUo7D9mht5yQYVYgsKBMFqAzpNwAheUziBHE1mhkAQDnRNyTArZsiyczWpmchy1H6nEzCeLpa7Xm5BGxpbHRP2dKKUR3puTv')
        obj.address.toString().should.equal('1CwgwxqUVapWbgk6ssLruv9eHxHe6LvCe6')
      })
    })
  })

  describe('@asyncSign', function () {
    it('should compute the same as bitcore', function () {
      return asink(function *() {
        let privkey = Privkey().fromRandom()
        let sig = yield CryptoWorkers.asyncSign(hashbuf, privkey, 'big')
        let keypair = Keypair().fromPrivkey(privkey)
        sig.toString().should.equal(ECDSA.sign(hashbuf, keypair, 'big').toString())
      })
    })
  })

  describe('@asyncSignCompact', function () {
    it('should compute a compact signature', function () {
      return asink(function *() {
        let privkey = Privkey().fromRandom()
        let sig = yield CryptoWorkers.asyncSignCompact(hashbuf, privkey)
        should.exist(sig.recovery)
        should.exist(sig.compressed)
      })
    })
  })

  describe('@asyncVerifySignature', function () {
    it('should return true for a valid signature', function () {
      return asink(function *() {
        let privkey = Privkey().fromRandom()
        let pubkey = Pubkey().fromPrivkey(privkey)
        let sig = yield CryptoWorkers.asyncSign(hashbuf, privkey, 'big')
        let verified = yield CryptoWorkers.asyncVerifySignature(hashbuf, sig, pubkey)
        should.exist(verified)
        verified.should.eql(true)
      })
    })

    it('should return false for an invalid signature', function () {
      return asink(function *() {
        let privkey = Privkey().fromRandom()
        let otherPrivkey = Privkey().fromRandom()
        let otherPubkey = Pubkey().fromPrivkey(otherPrivkey)
        let sig = yield CryptoWorkers.asyncSign(hashbuf, privkey, 'big')
        let verified = yield CryptoWorkers.asyncVerifySignature(hashbuf, sig, otherPubkey)
        should.exist(verified)
        verified.should.eql(false)
      })
    })

    it('should reject the promise if any arguments are missing, null, or undefined', function () {
      return asink(function *() {
        let privkey = Privkey().fromRandom()
        let pubkey = Pubkey().fromPrivkey(privkey)
        let sig = yield CryptoWorkers.asyncSign(hashbuf, privkey, 'big')
        try {
          yield CryptoWorkers.asyncVerifySignature(null, sig, pubkey)
          should.not.exist(true)
        } catch (err) {
          should.exist(err)
        }
        try {
          yield CryptoWorkers.asyncVerifySignature(undefined, sig, pubkey)
          should.not.exist(true)
        } catch (err) {
          should.exist(err)
        }
        try {
          yield CryptoWorkers.asyncVerifySignature(hashbuf, null, sig)
          should.not.exist(true)
        } catch (err) {
          should.exist(err)
        }
        try {
          yield CryptoWorkers.asyncVerifySignature(hashbuf, undefined, sig)
          should.not.exist(true)
        } catch (err) {
          should.exist(err)
        }
        try {
          yield CryptoWorkers.asyncVerifySignature(hashbuf, sig, null)
          should.not.exist(true)
        } catch (err) {
          should.exist(err)
        }
        try {
          yield CryptoWorkers.asyncVerifySignature(hashbuf, sig, undefined)
          should.not.exist(true)
        } catch (err) {
          should.exist(err)
        }
      })
    })
  })

  describe('@asyncVerifyCompactSig', function () {
    it('should validate this signature', function () {
      return asink(function *() {
        let keypair = Keypair().fromRandom()
        let sig = ECDSA.sign(hashbuf, keypair)
        sig = ECDSA.calcrecovery(sig, keypair.pubkey, hashbuf)

        let obj = yield CryptoWorkers.asyncVerifyCompactSig(hashbuf, sig)
        obj.verified.should.equal(true)
        Buffer.compare(obj.pubkey.toDER(), keypair.pubkey.toDER()).should.equal(0)
      })
    })
  })

  describe('@asyncSignTransaction', function () {
    it('should sign this transaction', function () {
      return asink(function *() {
        // This transaction builder code was copied from fullnode.
        let txb = new Txbuilder()

        // make change address
        let privkey = Privkey().fromBN(BN(1))
        let keypair = Keypair().fromPrivkey(privkey)
        let changeaddr = Address().fromPubkey(keypair.pubkey)

        // make addresses to send from
        let privkey1 = Privkey().fromBN(BN(2))
        let keypair1 = Keypair().fromPrivkey(privkey1)
        let addr1 = Address().fromPubkey(keypair1.pubkey)

        let privkey2 = Privkey().fromBN(BN(3))
        let keypair2 = Keypair().fromPrivkey(privkey2)
        let addr2 = Address().fromPubkey(keypair2.pubkey)

        // make addresses to send to
        let saddr1 = addr1
        let saddr2 = Address().fromRedeemScript(Script().fromString('OP_RETURN')) // fake, unredeemable p2sh address

        // txouts that we are spending
        let scriptout1 = Script().fromString('OP_DUP OP_HASH160 20 0x' + addr1.hashbuf.toString('hex') + ' OP_EQUALVERIFY OP_CHECKSIG')
        let scriptout2 = Script().fromString('OP_DUP OP_HASH160 20 0x' + addr2.hashbuf.toString('hex') + ' OP_EQUALVERIFY OP_CHECKSIG')
        let txout1 = Txout(BN(1e8), scriptout1)
        let txout2 = Txout(BN(1e8 + 0.001e8), scriptout2) // contains extra that we will use for the fee

        let txhashbuf = new Buffer(32)
        txhashbuf.fill(0)
        let txoutnum1 = 0
        let txoutnum2 = 1

        txb.setFeePerKBNum(0.0001e8)
        txb.setChangeAddress(changeaddr)
        txb.from(txhashbuf, txoutnum1, txout1, keypair1.pubkey)
        txb.from(txhashbuf, txoutnum2, txout2, keypair2.pubkey)
        txb.to(BN(1e8), saddr1) // pubkeyhash address
        txb.to(BN(1e8), saddr2) // p2sh address
        // txb.randomizeInputs()
        // txb.randomizeOutputs()

        txb.build()

        let txb2 = yield CryptoWorkers.asyncSignTransaction(txb, [privkey1, privkey2])

        txb2.tx.txouts[1].valuebn.gt(0).should.equal(true)
        txb2.tx.txouts[1].valuebn.gt(546).should.equal(true)

        Txverifier.verify(txb2.tx, txb.utxoutmap, Interp.SCRIPT_VERIFY_P2SH).should.equal(true)
      }, this)
    })
  })
})
