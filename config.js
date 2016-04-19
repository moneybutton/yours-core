/**
 * Configuration
 * =============
 *
 * These are YoursCore-wide configuration settings. Set these environment variables
 * to change the behavior of YoursCore.
 */
'use strict'
require('fullnode/config')

// By default, we assume browser-loaded javascript is served from the root
// directory, "/", of the http server. karma, however, assumes files are in the
// "/base/" directory, thus we invented this variable to allow overriding the
// directory. If you wish to put your javascript somewhere other than root,
// specify it by setting this environment variable before building. Some people
// will also need it if they need to put their js in some specific location.
if (!process.env.YOURS_CORE_JS_BASE_URL) {
  process.env.YOURS_CORE_JS_BASE_URL = '/'
}

if (!process.env.YOURS_CORE_JS_BUNDLE_FILE) {
  process.env.YOURS_CORE_JS_BUNDLE_FILE = 'yours-core.js'
}

if (!process.env.YOURS_CORE_JS_TESTS_FILE) {
  process.env.YOURS_CORE_JS_TESTS_FILE = 'yours-core-tests.js'
}

if (!process.env.YOURS_CORE_BLOCKCHAIN_API_URI) {
  process.env.YOURS_CORE_BLOCKCHAIN_API_URI = 'https://insight.bitpay.com/api/'
}

module.exports = process.env
