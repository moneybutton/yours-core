/**
 * ConnectionBrowserWebRTC
 * =======================
 *
 * A browser <-> browser connection over Web RTC. Technically, while this code
 * must be run inside a web browser, the other side does not have to be a web
 * browser, but it almost always will be, until we get server-side Web RTC
 * working. Normally you wouldn't use this class by itself - you would use
 * NetworkBrowserWebRTC.prototype.connect to create an object for you.
 */
'use strict'
let Struct = require('fullnode/lib/struct')
let Msg = require('./msg')
let spawn = require('../util/spawn')
let EventEmitter = require('events')

let Connection = function ConnectionBrowserWebRTC (peerjsConnection) {
  if (!(this instanceof Connection)) {
    return new Connection(peerjsConnection)
  }
  this.fromObject({peerjsConnection})
}

Connection.prototype = Object.create(Struct.prototype)
Connection.prototype.constructor = Connection
Object.assign(Connection.prototype, EventEmitter.prototype)

Connection.prototype.monitor = function () {
  this.peerjsConnection.on('data', this.asyncHandleData.bind(this))
  this.peerjsConnection.on('error', this.handleError.bind(this))
  this.peerjsConnection.on('close', this.handleClose.bind(this))
  return this
}

Connection.prototype.asyncHandleData = function (data) {
  return spawn(function *() {
    let buf = new Buffer(new Uint8Array(data))
    let msg
    try {
      msg = Msg().fromBuffer(buf) // Will throw if can't be parsed
      yield msg.asyncValidate() // Will throw if invalid
    } catch (error) {
      let error = new Error('Could not parse message from peer: ' + error.message)
      this.handleError(error)
      return
    }
    this.emit('msg', msg)
    return msg
  }.bind(this))
}

Connection.prototype.sendMsg = function (msg) {
  let buf = msg.toBuffer()
  this.peerjsConnection.send(buf)
  return this
}

Connection.prototype.handleError = function (error) {
  this.emit('error', error)
  this.close()
  return this
}

Connection.prototype.handleClose = function () {
  this.emit('close')
  return this
}

Connection.prototype.close = function () {
  this.peerjsConnection.close()
  this.handleClose()
  return this
}

/**
 * Return the PeerJS id of the peer we are connected to.
 */
Connection.prototype.getId = function () {
  return this.peerjsConnection.peer
}

module.exports = Connection
