/* global describe,it,before,after */
'use strict'
let User = require('../../lib/user')
let DB = require('../../lib/db')
let ContentAuth = require('../../lib/content-auth')
let CoreContent = require('../../lib/core-content')
let CoreBitcoin = require('../../lib/core-bitcoin')
let should = require('should')
let Address = require('fullnode/lib/address')

describe('CoreContent', function () {
  let contentauth
  let user = User().fromRandom()
  let db = DB('datt-testdatabase')

  before(function () {
    return db.init()
  })

  after(function () {
    return db.destroy()
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
    it('should get a new contentauth', function () {
      let corecontent = CoreContent(db)
      let privkey = user.masterxprv.privkey
      let pubkey = user.masterxprv.pubkey
      let address = Address().fromPubkey(pubkey)
      return CoreBitcoin(db).asyncGetLatestBlockInfo().then(info => {
        let blockhashbuf = info.hashbuf
        let blockheightnum = info.height
        return corecontent.asyncNewContentAuth(pubkey, privkey, address, user.name, 'general', 'title', 'body', blockhashbuf, blockheightnum)
      }).then(contentauth => {
        ;(contentauth instanceof ContentAuth).should.equal(true)
        let content = contentauth.getContent()
        content.name.should.equal(user.name)
        contentauth.verify().should.equal(true)
      })
    })
  })
})
