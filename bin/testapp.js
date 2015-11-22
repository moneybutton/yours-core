#!/usr/bin/env node
/**
 * Test app that runs the app server and rendezvous server.
 */
'use strict'

let createRendezvousServer = require('../server/rendezvous').createRendezvousServer
let createAppServer = require('../server/app').createAppServer

createRendezvousServer(3031)
createAppServer(3030)
