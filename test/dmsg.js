/* global Fullnode,describe,it */
'use strict'
let Constants = require('../lib/constants')
let DMsg = require('../lib/dmsg')
let BR = Fullnode.BR
let BW = Fullnode.BW
let should = require('should')

describe('DMsg', function () {
  let msghex = '255a484b696e76000000000000000000000000005df6e0e2'
  let msgbuf = new Buffer(msghex, 'hex')
  let msg = DMsg().fromHex(msghex)
  let msgjson = msg.toJSON()
  let msgjsonstr = JSON.stringify(msgjson)

  it('should satisfy this basic API', function () {
    let msg = new DMsg()
    should.exist(msg)
    msg = DMsg()
    should.exist(msg)
    msg.magicnum.should.equal(Constants.Msg.magicnum)
  })

  describe('#setCmd', function () {
    it('should set the command', function () {
      let msg = DMsg()
      msg.setCmd('inv')
      let cmdbuf = new Buffer(12)
      cmdbuf.fill(0)
      cmdbuf.write('inv')
      Buffer.compare(cmdbuf, msg.cmdbuf).should.equal(0)
    })
  })

  describe('#getCmd', function () {
    it('should get the command', function () {
      let msg = DMsg()
      msg.setCmd('inv')
      msg.getCmd().should.equal('inv')
    })

    it('should get the command when the command is 12 chars', function () {
      let msg = DMsg()
      msg.setCmd('a'.repeat(12))
      msg.getCmd().should.equal('a'.repeat(12))
    })

    it('should get the command when there are extra 0s', function () {
      let msg = DMsg()
      msg.setCmd('a')
      msg.cmdbuf.write('a', 2)
      msg.getCmd().should.equal('a\u0000a')
    })
  })

  describe('#setData', function () {
    it('should data to a blank buffer', function () {
      let msg = DMsg()
      msg.setCmd('inv')
      msg.setData(new Buffer([]))
      msg.isValid().should.equal(true)
    })
  })

  describe('#genFromBuffers', function () {
    it('should parse this known message', function () {
      let msgassembler, msg, next

      // test whole message at once
      msg = DMsg()
      msgassembler = msg.genFromBuffers()
      next = msgassembler.next() // one blank .next() is necessary
      next = msgassembler.next(msgbuf)
      next.value.length.should.equal(0)
      next.done.should.equal(true)
      msg.toHex().should.equal(msghex)

      // test message one byte at a time
      msg = DMsg()
      msgassembler = msg.genFromBuffers()
      msgassembler.next() // one blank .next() is necessary
      msgassembler.next() // should be able to place in multiple undefined buffers
      msgassembler.next(new Buffer([])) // should be able to place zero buf
      for (let i = 0; i < msgbuf.length; i++) {
        let onebytebuf = msgbuf.slice(i, i + 1)
        next = msgassembler.next(onebytebuf)
      }
      msg.toHex().should.equal(msghex)
      next.done.should.equal(true)
      next.value.length.should.equal(0)

      // test message three bytes at a time
      msg = DMsg()
      msgassembler = msg.genFromBuffers()
      msgassembler.next() // one blank .next() is necessary
      for (let i = 0; i < msgbuf.length; i += 3) {
        let three = msgbuf.slice(i, i + 3)
        next = msgassembler.next(three)
      }
      msg.toHex().should.equal(msghex)
      next.done.should.equal(true)
      next.value.length.should.equal(0)
    })

    it('should throw an error for invalid magicnum in strict mode', function () {
      let msg = DMsg().fromBuffer(msgbuf)
      msg.magicnum = 0
      ;(function () {
        let msgassembler = DMsg().genFromBuffers({strict: true})
        msgassembler.next()
        msgassembler.next(msg.toBuffer())
      }).should.throw('invalid magicnum')
    })

    it('should throw an error for message over max size in strict mode', function () {
      let msgbuf2 = new Buffer(msgbuf)
      msgbuf2.writeUInt32BE(Constants.maxsize + 1, 4 + 12)
      ;(function () {
        let msgassembler = DMsg().genFromBuffers({strict: true})
        msgassembler.next()
        msgassembler.next(msgbuf2)
      }).should.throw('message size greater than maxsize')
    })
  })

  describe('#fromBuffer', function () {
    it('should parse this known message', function () {
      let msg = DMsg().fromBuffer(msgbuf)
      msg.toHex().should.equal(msghex)
    })
  })

  describe('#toBuffer', function () {
    it('should parse this known message', function () {
      let msg = DMsg().fromBuffer(msgbuf)
      msg.toBuffer().toString('hex').should.equal(msghex)
    })
  })

  describe('#fromBR', function () {
    it('should parse this known message', function () {
      let br = BR(msgbuf)
      let msg = DMsg().fromBR(br)
      msg.toHex().should.equal(msghex)
    })
  })

  describe('#toBW', function () {
    it('should create this known message', function () {
      let bw = BW()
      DMsg().fromHex(msghex).toBW(bw).toBuffer().toString('hex').should.equal(msghex)
      DMsg().fromHex(msghex).toBW().toBuffer().toString('hex').should.equal(msghex)
    })
  })

  describe('#fromJSON', function () {
    it('should parse this known json msg', function () {
      DMsg().fromJSON(msgjson).toHex().should.equal(msghex)
    })
  })

  describe('#toJSON', function () {
    it('should create this known message', function () {
      JSON.stringify(DMsg().fromHex(msghex).toJSON()).should.equal(msgjsonstr)
    })
  })

  describe('#isValid', function () {
    it('should know these messages are valid or invalid', function () {
      DMsg().fromHex(msghex).isValid().should.equal(true)
    })
  })
})
