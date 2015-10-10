/* global describe,it,before,after */
'use strict'
let Peers = require('../../lib/peers')
let spawn = require('../../lib/spawn')
let should = require('should')

describe('Peers', function () {
  if (!process.browser) {
    // TODO: This code is intended to work both in a browser and in node
    return
  }

  let peers
  let Network
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
    peers.close()
  })

  describe('#asyncConnect', function () {
    it('should be able to connect to a peer in the same process', function () {
      return spawn(function *() {
        let network2 = Network()
        yield network2.asyncInitialize()
        let obj = yield peers.asyncConnect(network2.getConnectionInfo())
        should.exist(obj.connection)
        should.exist(obj.network)
      })
    })
  })
})
