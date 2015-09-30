/* global DattCore */
/**
 * This front-end entry point only serves to render the index component.
 */
'use strict'
let React = require('react')
let Index = require('./index.jsx')

// global dattcore application - the p2p/db/logic of datt
global.dattcore = DattCore.create()
let dattcore = global.dattcore

let index = <Index apptitle='Datt Alpha' dattcore={dattcore}/>
React.render(index, document.getElementById('container'))
