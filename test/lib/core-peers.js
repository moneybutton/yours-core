/* global describe,it */
'use strict'
let CorePeers = require('../../lib/core-peers')
let MsgPing = require('../../lib/msg-ping')
let MsgPong = require('../../lib/msg-pong')
let spawn = require('../../lib/spawn')
let should = require('should')
let sinon = require('sinon')

describe('CorePeers', function () {
  it('should exist', function () {
    let corepeers = CorePeers()
    should.exist(CorePeers)
    should.exist(CorePeers())
    should.exist(corepeers)
  })

  describe('#handleMsgPing', function () {
    it('should send a pong in response to a ping', function () {
      let msgPing = MsgPing().fromRandom()
      let msgPong = MsgPong().fromMsgPing(msgPing)
      let connection = {}
      connection.sendMsg = sinon.spy()
      let obj = {
        msg: msgPing.toMsg(),
        connection: connection
      }
      let corepeers = CorePeers()
      corepeers.handleMsgPing(obj)
      connection.sendMsg.calledOnce.should.equal(true)
      connection.sendMsg.getCall(0).args[0].toHex().should.equal(msgPong.toMsg().toHex())
    })
  })

  describe('#asyncConnect', function () {
    if (!process.browser) {
      // TODO: Enable this test for node once web sockets is implemented.
      return
    }
    it('should be able to connect to another node and exchange ping/pong', function () {
      return spawn(function *() {
        let corepeers1 = CorePeers()
        yield corepeers1.asyncInitialize()
        let corepeers2 = CorePeers()
        yield corepeers2.asyncInitialize()
        // let connectionInfo1 = corepeers1.peers.networks.webrtc.getConnectionInfo()
        let connectionInfo2 = corepeers2.peers.networks.webrtc.getConnectionInfo()
        yield corepeers1.asyncConnect(connectionInfo2)
        corepeers1.peers.networks.webrtc.connections.length.should.equal(1)
        corepeers2.peers.networks.webrtc.connections.length.should.equal(1)
        yield new Promise((resolve, reject) => {
          let msgPing = MsgPing().fromRandom()
          corepeers1.on('msg', obj => {
            let msg = obj.msg
            msg.getCmd().should.equal('pong')
            resolve()
          })
          corepeers1.broadcastMsg(msgPing.toMsg())
        })
        corepeers1.close()
        corepeers2.close()
      })
    })
  })
})
