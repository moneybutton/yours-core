/* global describe,it */
'use strict'
let ContentAuth = require('../lib/contentauth')
let CorePeers = require('../lib/corepeers')
let MsgContentAuth = require('../lib/msgcontentauth')
let MsgPing = require('../lib/msgping')
let MsgPong = require('../lib/msgpong')
let should = require('should')
let sinon = require('sinon')
let asink = require('asink')

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

  describe('asyncHandleMsgContentAuth', function () {
    it('should emit peers-contentauth on valid contentauth', function () {
      return asink(function *() {
        let contentauthhex = '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe41f04b47a4636d379788e73dc9d2a048966ce7b79c576c8e6e994af10d3fa6a47ce3ddaed3a9b02d2e8e19c6305a0433fb5aa93f6f2a8cd86cdad8b2a30030216a8f1a23a0fe332b99dbde9f1debf204b24d3e393cca488610e00000000000000000005c0750000000000000000000000000000000000000000000000000000000000000000000001503054427b004747e8746cddb33b0f7f95a90f89f89fb387cbb67b226e616d65223a226d796e616d65222c226c6162656c223a226d796c6162656c222c227469746c65223a22636f6e74656e74207469746c65222c2274797065223a226d61726b646f776e222c22626f6479223a22636f6e74656e7420626f6479227d'
        let contentauth = ContentAuth().fromHex(contentauthhex)
        let msg = MsgContentAuth().fromContentAuth(contentauth).toMsg()
        let corepeers = CorePeers()
        corepeers.db = {}
        corepeers.db.put = sinon.spy()
        corepeers.emit = sinon.spy()
        yield corepeers.asyncHandleMsgContentAuth({msg})
        corepeers.db.put.calledOnce.should.equal(true)
        corepeers.emit.calledOnce.should.equal(true)
        corepeers.emit.getCall(0).args[0].should.equal('contentauth')
      })
    })
  })

  describe('#asyncConnect', function () {
    if (!process.browser) {
      // TODO: Enable this test for node once web sockets is implemented.
      return
    }
    it('should be able to connect to another node and exchange ping/pong', function () {
      return asink(function *() {
        let corepeers1 = CorePeers()
        yield corepeers1.asyncInitialize()
        let corepeers2 = CorePeers()
        yield corepeers2.asyncInitialize()
        // let connectionInfo1 = corepeers1.peers.networksWebRTC.getConnectionInfo()
        let connectionInfo2 = corepeers2.peers.networkWebRTC.getConnectionInfo()
        yield corepeers1.asyncConnect(connectionInfo2)
        corepeers1.peers.networkWebRTC.connections.length.should.equal(1)
        corepeers2.peers.networkWebRTC.connections.length.should.equal(1)
        yield new Promise((resolve, reject) => {
          let msgPing = MsgPing().fromRandom()
          corepeers1.on('msg', (obj) => {
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

  describe('#numActiveConnections', function () {
    it('should call peers.numActiveConnections', function () {
      let corepeers = CorePeers()
      corepeers.peers = {}
      corepeers.peers.numActiveConnections = sinon.spy()
      corepeers.numActiveConnections()
      corepeers.peers.numActiveConnections.calledOnce.should.equal(true)
    })
  })

  describe('#asyncDiscoverAndConnect', function () {
    it('should call peers.asyncDiscoverAndConnect', function () {
      return asink(function *() {
        let corepeers = CorePeers()
        corepeers.peers = {}
        corepeers.peers.asyncDiscoverAndConnect = sinon.spy()
        yield corepeers.asyncDiscoverAndConnect()
        corepeers.peers.asyncDiscoverAndConnect.calledOnce.should.equal(true)
      })
    })
  })
})
