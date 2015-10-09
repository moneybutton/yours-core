/* global describe,it */
'use strict'
let Connection
let PeerJS
let Msg = require('../../lib/msg')
let sinon = require('sinon')
let should = require('should')

describe('ConnectionBrowserWebRTC', function () {
  // Browser-only code shouldn't be tested in node
  if (!process.browser) {
    return
  }

  Connection = require('../../lib/connection-browser-webrtc')

  it('should exist', function () {
    should.exist(Connection)
    should.exist(Connection())
  })

  describe('#asyncOnData', function () {
    it('should parse this valid message', function () {
      let msghex = '255a484b76657261636b00000000000000000000'
      let msg = Msg().fromHex(msghex)
      let connection = Connection()
      connection.emit = sinon.spy()
      return connection.asyncOnData(msg.toBuffer()).then(msg => {
        ;(msg instanceof Msg).should.equal(true)
        msg.isValid().should.equal(true)
        connection.emit.calledWith('msg', msg).should.equal(true)
      })
    })
  })

  describe('#onError', function () {
    it('should emit an error and close', function () {
      let connection = Connection()
      connection.emit = sinon.spy()
      connection.close = sinon.spy()
      let error = new Error('test')
      connection.onError(error)
      connection.emit.calledOnce.should.equal(true)
      connection.emit.calledWith('error', error).should.equal(true)
      connection.close.calledOnce.should.equal(true)
    })
  })

  describe('#onClose', function () {
    it('should emit close', function () {
      let connection = Connection()
      connection.emit = sinon.spy()
      connection.onClose()
      connection.emit.calledWith('close').should.equal(true)
    })
  })

  describe('#close', function () {
    it('should close the peerjsConnection and initiate "onClose"', function () {
      let connection = Connection()
      connection.peerjsConnection = {}
      connection.peerjsConnection.close = sinon.spy()
      connection.onClose = sinon.spy()
      connection.close()
      connection.peerjsConnection.close.calledOnce.should.equal(true)
      connection.onClose.calledOnce.should.equal(true)
    })
  })
})
