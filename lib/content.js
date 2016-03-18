/* global fullnode */
/**
 * Content
 * =======
 *
 * A piece of content, i.e. something that is authored by a user and contains a
 * title and a body. Content can be stored in the database (see db-content) or
 * send across the network (msg-content). This file contains the logic of what
 * content is. The thing that manages storing/sending content is core-content.
 *
 * Note that a piece of content does not refer to other content - that is
 * because it is not authenticated. Only signed content can refer to other
 * signed content. i.e., if you want to comment on something, the Signed
 * Content should refer to another piece of Signed Content. But the content
 * does not refer to other content.
 */
'use strict'
let BW = fullnode.BW
let Struct = fullnode.Struct

function Content (name, label, title, type, body) {
  if (!(this instanceof Content)) {
    return new Content(name, label, title, type, body)
  }
  this.initialize()
  this.fromObject({name, label, title, type, body})
}

Content.prototype = Object.create(Struct.prototype)
Content.prototype.constructor = Content

Content.prototype.initialize = function () {
  this.name = 'satoshi'
  this.label = 'general'
  this.title = ''
  this.type = 'markdown'
  this.body = ''
  return this
}

Content.prototype.fromBR = function (br) {
  let jsonstr = br.read().toString()
  let obj = JSON.parse(jsonstr)
  this.name = obj.name
  this.label = obj.label
  this.title = obj.title
  this.type = obj.type
  this.body = obj.body
  return this
}

Content.prototype.toBW = function (bw) {
  if (!bw) {
    bw = BW()
  }
  let json = {
    name: this.name,
    label: this.label,
    title: this.title,
    type: this.type,
    body: this.body
  }
  bw.write(new Buffer(JSON.stringify(json)))
  return bw
}

Content.prototype.validate = function () {
  // TODO: Insert validation
  return this
}

module.exports = Content
