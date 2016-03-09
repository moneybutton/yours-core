/* global describe,it,before,after */
'use strict'
let DB = require('../../core/db')
let Content = require('../../core/content')
let ContentAuth = require('../../core/content-auth')
let DBContentAuth = require('../../core/db-content-auth')
let Keypair = fullnode.Keypair
let should = require('should')
let BR = fullnode.BR

describe('DBContentAuth', function () {
  let blockidhex = '00000000000000000e6188a4cc93e3d3244b20bfdef1e9bd9db932e30f3aa2f1'
  let blockhashbuf = BR(new Buffer(blockidhex, 'hex')).readReverse()
  let blockheightnum = 376949
  let hashbuf
  let db = DB('datt-testdatabase')

  before(function () {
    return db.asyncInitialize()
  })

  after(function () {
    return db.asyncDestroy()
  })

  it('should exist', function () {
    should.exist(DBContentAuth)
    should.exist(DBContentAuth())
  })

  describe('#asyncSave', function () {
    it('should save a new piece of content', function () {
      // Note: You can't save the same piece of content more than once, but the
      // test database is reused. We are being sure to create a random key,
      // which makes the hash different. Also, the default date will be
      // different on the data.
      let keypair = Keypair().fromRandom()
      let content = Content().fromObject({body: 'test body'})
      let contentauth = ContentAuth().setContent(content)
      contentauth.fromObject({
        blockhashbuf: blockhashbuf,
        blockheightnum: blockheightnum
      })
      contentauth.sign(keypair)
      return DBContentAuth(db).asyncSave(contentauth).then((_hashbuf) => {
        should.exist(_hashbuf)
        hashbuf = _hashbuf
        Buffer.isBuffer(hashbuf).should.equal(true)
        hashbuf.length.should.equal(32)
      })
    })
  })

  describe('#asyncGet', function () {
    it('should be able to get a contentauth we previously inserted', function () {
      return DBContentAuth(db).asyncGet(hashbuf).then((contentauth) => {
        ;(contentauth instanceof ContentAuth).should.equal(true)
        contentauth.getContent().body.should.equal('test body')
        should.exist(contentauth.cachehash)
      })
    })
  })

  describe('#asyncGetAll', function () {
    it('should return several contentauths after inserting some contentauths', function () {
      let keypair = Keypair().fromRandom()

      let content1 = Content().fromObject({body: 'test body'})
      let contentauth1 = ContentAuth().setContent(content1)
      contentauth1.fromObject({
        blockhashbuf: blockhashbuf,
        blockheightnum: blockheightnum
      })
      contentauth1.sign(keypair)

      let content2 = Content().fromObject({body: 'test body'})
      let contentauth2 = ContentAuth().setContent(content2)
      contentauth2.fromObject({
        blockhashbuf: blockhashbuf,
        blockheightnum: blockheightnum
      })
      contentauth2.sign(keypair)

      return DBContentAuth(db).asyncSave(contentauth1).then(() => {
        return DBContentAuth(db).asyncSave(contentauth2)
      }).then(() => {
        return DBContentAuth(db).asyncGetAll()
      }).then((contentauths) => {
        contentauths.length.should.greaterThan(0)
        for (let contentauth of contentauths) {
          ;(contentauth instanceof ContentAuth).should.equal(true)
          should.exist(contentauth.cachehash)
        }
      })
    })
  })
})
