/* global describe,it */
'use strict'
let ConnectionInfo = require('../core/connection-info')
let should = require('should')

describe('ConnectionInfo', function () {
  it('should exist', function () {
    should.exist(ConnectionInfo)
    should.exist(ConnectionInfo())
  })

  describe('#toHex', function () {
    it('should convert this connection info to hex', function () {
      let typebuf = new Buffer(12)
      typebuf.fill(0)
      typebuf.write('webrtc')
      typebuf.length.should.equal(12)
      typebuf.toString('utf-8', 0, 6).should.equal('webrtc')
      let objbuf = new Buffer(JSON.stringify({address: 'hello'}))
      let connectionInfo = ConnectionInfo(typebuf, objbuf)
      connectionInfo.toHex().should.equal('7765627274630000000000007b2261646472657373223a2268656c6c6f227d')
    })
  })

  describe('#fromHex', function () {
    it('should produce a connectionInfo from hex', function () {
      let connectionInfo = ConnectionInfo().fromHex('7765627274630000000000007b2261646472657373223a2268656c6c6f227d')
      ;(connectionInfo instanceof ConnectionInfo).should.equal(true)
    })
  })

  describe('#setType', function () {
    it('should set type', function () {
      let connectionInfo = ConnectionInfo().setType('webrtc')
      let typebuf = new Buffer(12)
      typebuf.fill(0)
      typebuf.write('webrtc')
      Buffer.compare(typebuf, connectionInfo.typebuf).should.equal(0)
    })
  })

  describe('#getType', function () {
    it('should get known type', function () {
      let connectionInfo = ConnectionInfo().setType('webrtc')
      connectionInfo.getType().should.equal('webrtc')
    })
  })

  describe('#setObj', function () {
    it('should set obj', function () {
      let connectionInfo = ConnectionInfo().setObj({address: 'test'})
      let buf = new Buffer(JSON.stringify({address: 'test'}))
      Buffer.compare(buf, connectionInfo.objbuf).should.equal(0)
    })
  })

  describe('#getObj', function () {
    it('should get known obj', function () {
      let connectionInfo = ConnectionInfo().setObj({address: 'test'})
      connectionInfo.getObj().address.should.equal('test')
    })
  })
})
