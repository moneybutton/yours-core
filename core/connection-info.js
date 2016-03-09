/**
 * ConnectionInfo
 * ==============
 *
 * The information you need to connect to a peer remotely. i.e., if we used TCP
 * connections for everything, you would need to know their IP address and
 * port. However, we do not support raw TCP connections, but rather web sockets
 * and Web RTC, which require more than just IP address and port.
 *
 * As of the initial commit, this class is not really ready yet, and will be
 * filled out as we add support for web sockets and Web RTC.
 */
'use strict'
let BW = require('fullnode').BW
let Struct = require('fullnode').Struct

function ConnectionInfo (typebuf, objbuf) {
  if (!(this instanceof ConnectionInfo)) {
    return new ConnectionInfo(typebuf, objbuf)
  }
  this.fromObject({typebuf, objbuf})
}

ConnectionInfo.prototype = Object.create(Struct.prototype)
ConnectionInfo.prototype.constructor = ConnectionInfo

ConnectionInfo.prototype.fromBR = function (br) {
  this.type = br.read(12)
  this.objbuf = br.read()
  return this
}

ConnectionInfo.prototype.toBW = function (bw) {
  if (!bw) {
    bw = BW()
  }
  bw.write(this.typebuf)
  bw.write(this.objbuf)
  return bw
}

ConnectionInfo.prototype.setType = function (type) {
  if (type !== 'socket' && type !== 'webrtc') {
    throw new Error('type must be either socket or webrtc')
  }
  let typebuf = new Buffer(12)
  typebuf.fill(0)
  typebuf.write(type)
  this.typebuf = typebuf
  return this
}

ConnectionInfo.prototype.getType = function () {
  let end = this.typebuf.length
  for (let i = end; i > 0; i--) {
    if (this.typebuf[i - 1] !== 0) {
      end = i
      break
    }
  }
  return this.typebuf.toString('utf8', 0, end)
}

ConnectionInfo.prototype.setObj = function (obj) {
  this.objbuf = new Buffer(JSON.stringify(obj))
  return this
}

ConnectionInfo.prototype.getObj = function () {
  return JSON.parse(this.objbuf.toString())
}

module.exports = ConnectionInfo
