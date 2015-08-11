var peer = require('peer')
var PeerServer = peer.PeerServer

var peerServerConfig = require('./config/peerServer.js')

var peerServer = new PeerServer(peerServerConfig)

console.log('PeerServer started, details below:')
console.log(JSON.stringify(peerServerConfig, null, 4))

var express = require('express')

var app = express()

app.use(express.static('public'))

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('Static content at http://%s:%s', host, port)
})
