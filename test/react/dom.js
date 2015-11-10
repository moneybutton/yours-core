/**
 * React tests rely on the existence either of a real DOM, or a virtual DOM.
 * Browsers have a real DOM, for for node, we need to mock up a fake DOM.
 */
'use strict'

// from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
function propagateToGlobal (window) {
  global.dom_propagated = []
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue
    if (key in global) continue

    global.dom_propagated.push(key)
    global[key] = window[key]
  }
}

module.exports.before = function () {
  if (!process.browser) {
    let jsdom = require('jsdom')
    global.document = jsdom.jsdom('<!doctype html><html><body></body></html>')
    global.window = global.document.defaultView
    global.dom_propagated = []

    propagateToGlobal(global.window)
  }
}

module.exports.after = function () {
  if (!process.browser) {
    global.dom_propagated.forEach(key => {
      global[key] = undefined
    })
    global.document = undefined
    global.window = undefined
  }
}
