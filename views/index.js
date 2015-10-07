/* global DattCore */
/**
 * This front-end entry point only serves to render the layout component.
 */
'use strict'
let React = require('react')
let Layout = require('./layout.jsx')
let os = require('os')

let config = {
  dbName: 'datt-development',
  dbBasePath: os.tmpdir()
}

// dattcore application - the p2p/db/logic of datt
let dattcore = DattCore.getGlobal(config)

let layout = <Layout apptitle='Datt' dattcore={dattcore}/>
React.render(layout, document.getElementById('container'))
