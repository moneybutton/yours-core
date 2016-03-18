/* global fullnode,describe,it,before,after */
'use strict'
let Peers = require('../lib/peers')
let Address = fullnode.Address
let Content = require('../lib/content')
let ContentAuth = require('../lib/content-auth')
let MsgContentAuth = require('../lib/msg-content-auth')
let BR = fullnode.BR
let Keypair = fullnode.Keypair
let sinon = require('sinon')
let asink = require('asink')
let should = require('should')

describe('Peers', function () {
  if (!process.browser) {
    // TODO: This code is intended to work both in a browser and in node
    return
  }

  let peers
  let Network, network2
  if (process.browser) {
    Network = require('../lib/network-browser-webrtc')
  } else {
    Network = require('../lib/network-node-socket')
  }

  let blockidhex = '00000000000000000e6188a4cc93e3d3244b20bfdef1e9bd9db932e30f3aa2f1'
  let blockhashbuf = BR(new Buffer(blockidhex, 'hex')).readReverse()
  let blockheightnum = 376949

  it('should exist', function () {
    should.exist(Peers)
    should.exist(Peers())
  })

  before(function () {
    peers = Peers()
    return peers.asyncInitialize()
  })

  after(function () {
    if (network2) {
      network2.close()
    }
    peers.close()
  })

  describe('#asyncConnect', function () {
    it('should be able to connect to a peer in the same process', function () {
      return asink(function *() {
        network2 = Network()
        yield network2.asyncInitialize()
        let pair = yield peers.asyncConnect(network2.getConnectionInfo())
        should.exist(pair.connection)
        should.exist(pair.network)
      })
    })
  })

  describe('#toJSON', function () {
    it('should return empty list for new peers', function () {
      let json = Peers().toJSON()
      json.length.should.equal(0)
      Array.isArray(json).should.equal(true)
    })

    it('should return a list if we are already connected somewhere', function () {
      // Note: We are relying on the global peers object which already has a
      // connection.
      let json = peers.toJSON()
      json.length.should.equal(1)
      Array.isArray(json).should.equal(true)
    })
  })

  describe('@connectionInfosFromJSON', function () {
    it('should return empty list for empty JSON array', function () {
      let connectionInfos = Peers.connectionInfosFromJSON([])
      connectionInfos.length.should.equal(0)
      Array.isArray(connectionInfos).should.equal(true)
    })

    it('should return list for real JSON array', function () {
      // Note: We are relying on the global peers object which already has a
      // connection.
      let json = peers.toJSON()
      let connectionInfos = Peers.connectionInfosFromJSON(json)
      connectionInfos.length.should.equal(1)
      Array.isArray(connectionInfos).should.equal(true)
    })
  })

  describe('#asyncConnectManyFromJSON', function () {
    it('should be able to connect to 0 peers', function () {
      return asink(function *() {
        let successes = yield peers.asyncConnectManyFromJSON([])
        successes.should.equal(0)
      })
    })

    it('should be able to connect to 1 peers', function () {
      return asink(function *() {
        let peers = Peers()
        yield peers.asyncInitialize()
        let network = Network()
        yield network.asyncInitialize()
        yield peers.asyncConnect(network.getConnectionInfo())
        let peers2 = Peers()
        yield peers2.asyncInitialize()
        let json = peers.toJSON()
        let successes = yield peers2.asyncConnectManyFromJSON(json)
        successes.should.equal(1)
      })
    })
  })

  describe('#asyncConnectMany', function () {
    it('should be able to connect to 0 peers', function () {
      return asink(function *() {
        let successes = yield peers.asyncConnectMany([])
        successes.should.equal(0)
      })
    })
  })

  describe('#asyncDiscoverAndConnect', function () {
    it('should reject if peers is not initialized', function () {
      return asink(function *() {
        let peers = Peers()
        let errors = 0
        try {
          yield peers.asyncDiscoverAndConnect()
        } catch (err) {
          errors++
        }
        errors.should.equal(1)
      })
    })

    if (!process.browser) {
      // TODO: Enable this part again once we add node network support
      return
    }
    it('should call asyncConnectMany when networkWebRTC is set', function () {
      return asink(function *() {
        let peers = Peers()
        peers.networkWebRTC = {}
        peers.networkWebRTC.asyncGetAllWebRTCPeerIDs = () => []
        peers.asyncConnectMany = sinon.spy()
        yield peers.asyncDiscoverAndConnect()
        peers.asyncConnectMany.calledOnce.should.equal(true)
      })
    })
  })

  describe('#numActiveConnections', function () {
    it('should return length of connections', function () {
      // TODO: This test will need to be updated once we add web socket support
      let peers = Peers()
      peers.networkWebRTC = {connections: []}
      peers.numActiveConnections().should.equal(0)
    })
  })

  describe('#broadcastMsg', function () {
    it('should send contentauth', function () {
      return asink(function *() {
        let content = Content().fromObject({
          title: 'test title',
          body: 'test body'
        })
        let keypair = Keypair().fromRandom()
        let address = Address().fromPubkey(keypair.pubkey)
        let contentauth = ContentAuth().setContent(content)
        contentauth.fromObject({
          blockhashbuf: blockhashbuf,
          blockheightnum: blockheightnum,
          address: address
        })
        contentauth.sign(keypair)

        // assume connection to network2 has already been made
        yield new Promise((resolve, reject) => {
          network2.connections[0].on('msg', (msg) => {
            let msgcontentauth = MsgContentAuth().fromMsg(msg)
            ;(msgcontentauth.contentauth instanceof ContentAuth).should.equal(true)
            resolve()
          })
          let msg = MsgContentAuth().fromContentAuth(contentauth).toMsg()
          peers.broadcastMsg(msg)
        })
      })
    })
  })
})
