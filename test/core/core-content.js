/* global describe,it,before,after */
'use strict'
let User = require('../../core/user')
let DB = require('../../core/db')
let ContentAuth = require('../../core/content-auth')
let CoreContent = require('../../core/core-content')
let CoreBitcoin = require('../../core/core-bitcoin')
let should = require('should')
let Address = require('fullnode/lib/address')

describe('CoreContent', function () {
  let contentauth
  let user = User().fromRandom()
  let db = DB('datt-testdatabase')

  before(function () {
    return db.asyncInitialize()
  })

  after(function () {
    return db.asyncDestroy()
  })

  it('should exist', function () {
    should.exist(CoreContent)
    should.exist(CoreContent())
  })

  describe('#asyncGetRecentContentAuth', function () {
    // TODO: Fill in.
  })

  describe('#asyncNewContentAuth', function () {
    it('should get a new contentauth', function () {
      let corecontent = CoreContent(db)
      let privkey = user.masterxprv.privkey
      let pubkey = user.masterxprv.pubkey
      let address = Address().fromPubkey(pubkey)
      return CoreBitcoin(db).asyncGetLatestBlockInfo().then(info => {
        let blockhashbuf = info.hashbuf
        let blockheightnum = info.height
        return corecontent.asyncNewContentAuth(pubkey, privkey, address, user.name, 'general', 'title', 'body', blockhashbuf, blockheightnum)
      }).then(_contentauth => {
        contentauth = _contentauth
        ;(contentauth instanceof ContentAuth).should.equal(true)
        let content = contentauth.getContent()
        content.name.should.equal(user.name)
        contentauth.verify().should.equal(true)
      })
    })
  })

  describe('#asyncPostContentAuth', function () {
    it('should not cause an error when posting valid contentauth', function () {
      let corecontent = CoreContent(db)
      return corecontent.asyncPostContentAuth(contentauth)
    })
  })

  describe('#asyncPostNewContentAuth', function () {
    it('should post a new contentauth', function () {
      let corecontent = CoreContent(db)
      let privkey = user.masterxprv.privkey
      let pubkey = user.masterxprv.pubkey
      let address = Address().fromPubkey(pubkey)
      return CoreBitcoin(db).asyncGetLatestBlockInfo().then(info => {
        let blockhashbuf = info.hashbuf
        let blockheightnum = info.height
        return corecontent.asyncPostNewContentAuth(pubkey, privkey, address, user.name, 'general', 'title', 'body', blockhashbuf, blockheightnum)
      }).then(hashbuf => {
        should.exist(hashbuf)
        Buffer.isBuffer(hashbuf).should.equal(true)
      })
    })
  })

  describe('#asyncGetRecentContentAuth', function () {
    it('should get some contentauths after inserting some', function () {
      let corecontent = CoreContent(db)
      let privkey = user.masterxprv.privkey
      let pubkey = user.masterxprv.pubkey
      let address = Address().fromPubkey(pubkey)
      return CoreBitcoin(db).asyncGetLatestBlockInfo().then(info => {
        let blockhashbuf = info.hashbuf
        let blockheightnum = info.height
        return corecontent.asyncPostNewContentAuth(pubkey, privkey, address, user.name, 'general', 'title', 'body', blockhashbuf, blockheightnum)
      }).then(hashbuf => {
        return corecontent.asyncGetRecentContentAuth()
      }).then(contentauths => {
        contentauths.length.should.greaterThan(0)
        for (let contentauth of contentauths) {
          ;(contentauth instanceof ContentAuth).should.equal(true)
        }
      })
    })
  })
})
