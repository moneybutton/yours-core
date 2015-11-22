/**
 * Rendezvous Server
 * =================
 *
 * The rendezvous server lets web peers (i.e., those peers that use Web RTC)
 * register their connection information so that other web peers can find and
 * connect to them. Theoretically, the rendezvous server is not strictly
 * necessary, as so long as there can be at least one reliable node hard-coded
 * into the app, the p2p protocol could actually serve as the rendezvous
 * server. But for now, we use a rendezvous server because it is technically
 * simpler.
 */
'use strict'
let ExpressPeerServer = require('peer').ExpressPeerServer
let express = require('express')

module.exports.createRendezvousServer = function createRendezvousServer (port) {
  let app = express()
  let server = app.listen(port, function () {
    let host = server.address().address
    let port = server.address().port
    console.log('View the rendezvous server at http://%s:%s/', host, port)
  })
  app.use('/', ExpressPeerServer(server, {debug: true, allow_discovery: true}))
  return server
}
