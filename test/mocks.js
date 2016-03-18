/* global fullnode */
/**
 * Mockups useful for testing
 */
'use strict'
let BR = fullnode.BR
let asink = require('asink')

exports.asyncGetLatestBlockInfo = function () {
  return asink(function *() {
    let idhex = '000000000000000010bf939fcce01f8f896d107febe519de2ebc75a4a29fef11'
    let idbuf = new Buffer(idhex, 'hex')
    let hashbuf = BR(idbuf).readReverse()
    let hashhex = hashbuf.toString('hex')
    let height = 376894
    return {idbuf, idhex, hashbuf, hashhex, height}
  })
}
