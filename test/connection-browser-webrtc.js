/* global describe,it */
'use strict'
let Connection
let DMsg = require('../lib/dmsg')
let sinon = require('sinon')
let asink = require('asink')
let should = require('should')

describe('ConnectionBrowserWebRTC', function () {
  // Browser-only code shouldn't be tested in node
  if (!process.browser) {
    return
  }

  Connection = require('../lib/connection-browser-webrtc')

  it('should exist', function () {
    should.exist(Connection)
    should.exist(Connection())
  })

  describe('#asyncHandleData', function () {
    it('should parse this valid message', function () {
      return asink(function *() {
        let msghex = '255a484b696e76000000000000000000000000005df6e0e2'
        let msg = DMsg().fromHex(msghex)
        let connection = Connection()
        connection.emit = sinon.spy()
        msg = yield connection.asyncHandleData(msg.toBuffer())
        ;(msg instanceof DMsg).should.equal(true)
        msg.isValid().should.equal(true)
        connection.emit.calledWith('dmsg', msg).should.equal(true)
      })
    })
  })

  describe('#handleError', function () {
    it('should emit an error and close', function () {
      let connection = Connection()
      connection.emit = sinon.spy()
      connection.close = sinon.spy()
      let error = new Error('test')
      connection.handleError(error)
      connection.emit.calledOnce.should.equal(true)
      connection.emit.calledWith('error', error).should.equal(true)
      connection.close.calledOnce.should.equal(true)
    })
  })

  describe('#handleClose', function () {
    it('should emit close', function () {
      let connection = Connection()
      connection.emit = sinon.spy()
      connection.handleClose()
      connection.emit.calledWith('close').should.equal(true)
    })
  })

  describe('#close', function () {
    it('should close the peerjsConnection and initiate "handleClose"', function () {
      let connection = Connection()
      connection.peerjsConnection = {}
      connection.peerjsConnection.close = sinon.spy()
      connection.handleClose = sinon.spy()
      connection.close()
      connection.peerjsConnection.close.calledOnce.should.equal(true)
      connection.handleClose.calledOnce.should.equal(true)
    })
  })
})
