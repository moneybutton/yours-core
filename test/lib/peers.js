/* global describe,it,before,after */
'use strict'
let Peers = require('../../lib/peers')
let MsgPing = require('../../lib/msg-ping')
let spawn = require('../../lib/spawn')
let should = require('should')

describe('Peers', function () {
  if (!process.browser) {
    // TODO: This code is intended to work both in a browser and in node
    return
  }

  let peers
  let Network, network2
  if (process.browser) {
    Network = require('../../lib/network-browser-webrtc')
  } else {
    Network = require('../../lib/network-node-socket')
  }

  it('should exist', function () {
    should.exist(Peers)
    should.exist(Peers())
  })

  before(function () {
    peers = Peers()
    return peers.asyncInitialize()
  })

  after(function () {
    network2.close()
    peers.close()
  })

  describe('#asyncConnect', function () {
    it('should be able to connect to a peer in the same process', function () {
      return spawn(function *() {
        network2 = Network()
        yield network2.asyncInitialize()
        let pair = yield peers.asyncConnect(network2.getConnectionInfo())
        should.exist(pair.connection)
        should.exist(pair.network)
      })
    })
  })

  describe('#broadcastMsg', function () {
    it('should send ping and get pong', function () {
      return spawn(function *() {
        let msgPing = MsgPing().fromRandom()
        let msg = msgPing.toMsg()
        let network1 = peers.networks.webrtc // TODO: Test should work in node also
        let connection = network1.connections[0]
        yield new Promise((resolve, reject) => {
          connection.once('msg', msg => {
            msg.getCmd().should.equal('pong')
            resolve()
          })
          peers.broadcastMsg(msg)
        })
      })
    })
  })
})
