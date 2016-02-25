/* global describe,it,before,after */
'use strict'
let Address = require('fullnode/lib/address')
let ContentAuth = require('../../core/content-auth')
let CoreContent = require('../../core/core-content')
let DB = require('../../core/db')
let User = require('../../core/user')
let asink = require('asink')
let should = require('should')
let mocks = require('./mocks')

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

  describe('#asyncGetContentAuth', function () {
    let corecontent
    let privkey
    let pubkey
    let address
    let name
    let info
    let blockhashbuf
    let blockheightnum

    let title
    let label
    let body

    let contentauth
    // let originalContent
    let hashbuf

    before(function () {
      return asink(function *() {
        // SETUP: initialize a fresh CoreContent instance and get mock user info and blockchain info
        corecontent = CoreContent(db)
        privkey = user.masterxprv.privkey
        pubkey = user.masterxprv.pubkey
        address = Address().fromPubkey(pubkey)
        name = user.name
        info = yield mocks.asyncGetLatestBlockInfo()
        blockhashbuf = info.hashbuf
        blockheightnum = info.height

        // SETUP: create and post new content to retrieve
        title = 'test title'
        label = 'testlabel'
        body = 'test body'

        contentauth = yield corecontent.asyncNewContentAuth(pubkey, privkey, address, name, label, title, body, blockhashbuf, blockheightnum)
        // originalContent = contentauth.getContent()
        hashbuf = yield corecontent.asyncPostContentAuth(contentauth)
      })
    })

    it('should return the contentauth by hashbuf, identical to original when ContentAuth#toHex output is compared', function () {
      return asink(function *() {
        let retrievedContentauth = yield corecontent.asyncGetContentAuth(hashbuf)

        // check that contentauth exists and is identical to the original by comparing the #toHex forms
        should.exist(retrievedContentauth)
        should.equal(contentauth.toHex(), retrievedContentauth.toHex())
      })
    })

    it('should return a contentauth with address, blockhashbuf, blockheightnum, and pubkey matching the original', function () {
      return asink(function *() {
        let retrievedContentauth = yield corecontent.asyncGetContentAuth(hashbuf)

        // the retrieved contentauth should exist
        should.exist(retrievedContentauth)

        // it should have the original address, blockhashbuf, blockheightnum, and pubkey associated
        should.exist(retrievedContentauth.address)
        address.toHex().should.equal(retrievedContentauth.address.toHex())

        blockhashbuf.toString('hex').should.equal(retrievedContentauth.blockhashbuf.toString('hex'))
        blockheightnum.should.equal(retrievedContentauth.blockheightnum)

        should.exist(retrievedContentauth.pubkey)
        pubkey.toHex().should.equal(retrievedContentauth.pubkey.toHex())
      })
    })

    //    it('should return a contentauth with content identical to original associated (where ContentAuth#getContent returns content with Content.title, Content.label, Content.body, Content.name and Content#toHex output matching the original)', function () {
    it('should return a contentauth with content identical to original associated (where ContentAuth#getContent returns with content.title, content.label, content.body, and content.name matching the original)', function () {
      return asink(function *() {
        let retrievedContentauth = yield corecontent.asyncGetContentAuth(hashbuf)

        // the contentauth should exist
        should.exist(retrievedContentauth)

        // it should have the original content associated
        let retrievedContent = retrievedContentauth.getContent()
        should.exist(retrievedContent)

        // TODO compare original and retrieved content hex
        // (N.B. why not now? Content#toHex doesn't work yet)
        // should.equal(originalContent.toHex(), retrievedContent.toHex())

        // compare content fields (title, label, body, name)
        title.should.equal(retrievedContent.title)
        label.should.equal(retrievedContent.label)
        body.should.equal(retrievedContent.body)
        name.should.equal(retrievedContent.name)
      })
    })
  })
})
