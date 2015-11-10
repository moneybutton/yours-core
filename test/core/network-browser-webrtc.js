/* global describe,it,before,after */
'use strict'
let Network
let should = require('should')
let MsgPing = require('../../core/msg-ping')
let MsgPong = require('../../core/msg-pong')
let spawn = require('../../util/spawn')

describe('NetworkBrowserWebRTC', function () {
  // Browser-only code shouldn't be tested in node
  if (!process.browser) {
    return
  }

  Network = require('../../core/network-browser-webrtc')

  it('should exist', function () {
    should.exist(Network)
    should.exist(Network())
  })

  describe('#asyncInitialize', function () {
    let network

    before(function () {
      network = Network()
    })

    after(function () {
      network.close()
    })

    it('should initialize', function () {
      let network = Network()
      return network.asyncInitialize()
    })
  })

  describe('#close', function () {
    it('should remove the peerjs object', function () {
      let network = Network()
      return network.asyncInitialize().then(() => {
        network.close()
        should.not.exist(network.peerjs)
      })
    })
  })

  describe('#asyncConnect', function () {
    it('should connect to another listener running in this same process and exchange ping/pong', function () {
      return spawn(function *() {
        let network1 = Network()
        let network2 = Network()
        yield network1.asyncInitialize()
        yield network2.asyncInitialize()
        let connectionInfo = network2.getConnectionInfo()
        let connection1, connection2
        try {
          connection1 = yield network1.asyncConnect(connectionInfo)
          connection2 = network2.connections[0]
          should.exist(connection1)
        } catch (error) {
          network1.close()
          network2.close()
          throw new Error('could not connect to other peer: ' + error)
        }
        let msgPing = MsgPing().fromRandom()
        yield new Promise((resolve, reject) => {
          connection1.on('msg', (msg) => {
            msg.getCmd().should.equal('pong')
            resolve()
          })
          connection2.on('msg', (msg) => {
            msg.getCmd().should.equal('ping')
            let msgPing = MsgPing().fromMsg(msg)
            let msgPong = MsgPong().fromMsgPing(msgPing)
            connection2.sendMsg(msgPong.toMsg())
          })
          connection1.sendMsg(msgPing.toMsg())
        })
        network1.close()
        network2.close()
      })
    })
  })

  describe('#asyncGetAllWebRTCPeerIDs', function () {
    it('should return a list of peers', function () {
      return spawn(function *() {
        let network = Network()
        yield network.asyncInitialize()
        let peers = yield network.asyncGetAllWebRTCPeerIDs()
        peers.length.should.greaterThan(0)
        console.log(peers)
      })
    })
  })
})
