/* global describe,it,before,after */
'use strict'
let Network
let should = require('should')
let MsgPing = require('../../lib/msg-ping')
let spawn = require('../../lib/spawn')

describe('NetworkBrowserWebRTC', function () {
  // Browser-only code shouldn't be tested in node
  if (!process.browser) {
    return
  }

  Network = require('../../lib/network-browser-webrtc')

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
        let connection
        try {
          connection = yield network1.asyncConnect(connectionInfo)
          should.exist(connection)
        } catch (error) {
          network1.close()
          network2.close()
          throw new Error('could not connect to other peer: ' + error)
        }
        let msgPing = MsgPing().fromRandom()
        yield new Promise((resolve, reject) => {
          connection.on('msg', (msg) => {
            msg.getCmd().should.equal('pong')
            resolve()
          })
          connection.sendMsg(msgPing.toMsg())
        })
        network1.close()
        network2.close()
      })
    })
  })
})
