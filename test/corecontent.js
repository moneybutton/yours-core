/* global Fullnode,describe,it,before,after */
'use strict'
let Address = Fullnode.Address
let ContentAuth = require('../lib/contentauth')
let CoreContent = require('../lib/corecontent')
let DB = require('../lib/db')
let User = require('../lib/user')
let asink = require('asink')
let should = require('should')
let mocks = require('./mocks')

describe('CoreContent', function () {
  let contentauth
  let user = User().fromRandom()
  let db = DB('yourscore-testdatabase')

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

  describe('#asyncNewContentAuth', function () {
    it('should get a new contentauth', function () {
      return asink(function *() {
        let corecontent = CoreContent(db)
        let privkey = user.masterxprv.privkey
        let pubkey = user.masterxprv.pubkey
        let address = Address().fromPubkey(pubkey)
        let info = yield mocks.asyncGetLatestBlockInfo()
        let blockhashbuf = info.hashbuf
        let blockheightnum = info.height
        contentauth = yield corecontent.asyncNewContentAuth(pubkey, privkey, address, user.name, 'general', 'title', 'body', blockhashbuf, blockheightnum)
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
      return asink(function *() {
        let corecontent = CoreContent(db)
        let privkey = user.masterxprv.privkey
        let pubkey = user.masterxprv.pubkey
        let address = Address().fromPubkey(pubkey)
        let info = yield mocks.asyncGetLatestBlockInfo()
        let blockhashbuf = info.hashbuf
        let blockheightnum = info.height
        let hashbuf = yield corecontent.asyncPostNewContentAuth(pubkey, privkey, address, user.name, 'general', 'title', 'body', blockhashbuf, blockheightnum)
        should.exist(hashbuf)
        Buffer.isBuffer(hashbuf).should.equal(true)
      })
    })
  })

  describe('#asyncGetRecentContentAuth', function () {
    it('should get some contentauths after inserting some', function () {
      return asink(function *() {
        let corecontent = CoreContent(db)
        let privkey = user.masterxprv.privkey
        let pubkey = user.masterxprv.pubkey
        let address = Address().fromPubkey(pubkey)
        let info = yield mocks.asyncGetLatestBlockInfo()
        let blockhashbuf = info.hashbuf
        let blockheightnum = info.height
        let hashbuf = yield corecontent.asyncPostNewContentAuth(pubkey, privkey, address, user.name, 'general', 'title', 'body', blockhashbuf, blockheightnum)
        should.exist(hashbuf)
        let contentauths = yield corecontent.asyncGetRecentContentAuth()
        contentauths.length.should.greaterThan(0)
        for (let contentauth of contentauths) {
          ;(contentauth instanceof ContentAuth).should.equal(true)
        }
      })
    })
  })
})
