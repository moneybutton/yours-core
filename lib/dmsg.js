/* global fullnode */
/**
 * DMsg
 * ====
 *
 * A message on the datt p2p network. These messages are modeled after bitcoin
 * messages and are exactly the same, except for a different magicnum. All
 * message types should be prefixed with the letter "D" to clarify that they
 * are Datt p2p messages and not bitcoin p2p messages.
 */
'use strict'
let Constants = require('./constants')
let Msg = fullnode.Msg

let DMsg = Msg.inject({
  Constants: Constants
})

module.exports = DMsg
