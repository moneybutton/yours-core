/* global describe,it,before,after */
'use strict'
let DB = require('../../lib/db')
let Content = require('../../lib/content')
let ContentAuth = require('../../lib/content-auth')
let DBContentAuth = require('../../lib/db-content-auth')
let Keypair = require('fullnode/lib/keypair')
let should = require('should')
let BR = require('fullnode/lib/br')

describe('DBContentAuth', function () {
  let blockidhex = '00000000000000000e6188a4cc93e3d3244b20bfdef1e9bd9db932e30f3aa2f1'
  let blockhashbuf = BR(new Buffer(blockidhex, 'hex')).readReverse()
  let blockheightnum = 376949
  let hashbuf
  let db = DB('datt-testdatabase')

  before(function () {
    return db.init()
  })

  after(function () {
    return db.destroy()
  })

  it('should exist', function () {
    should.exist(DBContentAuth)
    should.exist(DBContentAuth())
  })

  describe('#save', function () {
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
      return DBContentAuth(db).save(contentauth).then(_hashbuf => {
        should.exist(_hashbuf)
        hashbuf = _hashbuf
      })
    })
  })

  describe('#get', function () {
    it('should be able to get a contentauth we previously inserted', function () {
      return DBContentAuth(db).get(hashbuf).then(contentauth => {
        ;(contentauth instanceof ContentAuth).should.equal(true)
        contentauth.getContent().body.should.equal('test body')
      })
    })
  })
})
