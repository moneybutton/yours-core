/**
 * This front-end entry point only serves to render the index component.
 */
'use strict'
let React = require('react')
let Index = require('./index.jsx')

let index = <Index apptitle='Datt'/>
React.render(index, document.getElementById('container'))
