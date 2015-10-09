/* global describe,it,before,after */
'use strict'
let Network
let should = require('should')

describe('NetworkBrowserWebRTC', function () {
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
})
