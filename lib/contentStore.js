var util = require('util')
var events = require('events')
var Content = require('./content')
var q = require('q')
var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
// PouchDB.debug.enable('*')
var bitcore = require('bitcore')
var DattUtil = require('./util')
var logger = require('./logger')

/**
 * The content store is for storing "content", i.e. the content that can be
 * stored and retrieved on the network. TODO: This somehow needs to be
 * refactored to support not just 'content', but also 'actions', i.e. upvoting
 * someone or flagging a piece of content. Actions may also be called
 * 'content', that is yet-to-be-decided, but either way, content and actions
 * need to have some kind of unified interface to the database.
 */
function ContentStore (options) {
  this.db = undefined

  options = options || {}
  if (typeof (options) === 'string') {
    options = {'dbName': options}
  }

  this._dbName = options.dbName || 'datt-db-content'
  this._clearDbOnStart = options._clearDbOnStart
}

// TODO: Why does the ContentStore need to be an eventEmitter? What type of
// events would this ever emit?
util.inherits(ContentStore, events.EventEmitter)

// TODO: See above TODO about why the content store should be an EventEmitter,
// and lib/util.js on what the purpose of this is.
ContentStore.prototype.tapPromiseAndEmitResult = DattUtil.tapPromiseAndEmitResult

/**
 * Initialize the content store, including setting what indexes exist on the
 * fields. (Since we are using PouchDB, which is a no-sql data store, there are
 * no tables, but there can still be indexes.)
 */
ContentStore.prototype.init = function init () {
  logger.debug("DB NAME: '" + this._dbName + "'")

  this.db = new PouchDB(this._dbName)
  logger.debug(this.db.adapter || this.db.db)

  var ownerUsernameIndexPromise = q(this.db.createIndex({
    'index': {
      'fields': ['owner_username']
    }
  }))

  var ownerAddressIndexPromise = q(this.db.createIndex({
    'index': {
      'fields': ['owner_address']
    }
  }))

  this.emit('init', this)

  return q.allSettled([ownerUsernameIndexPromise, ownerAddressIndexPromise]).then(function (values) {
    this.emit('ready')
  }.bind(this))
}

/**
 * Given a Content object, extract the fields and put it into a normal object
 * ready for storing to the database.  TODO: This should probably be replaced
 * with a .toJSON() method on Content.prototype
 */
ContentStore._getStorageFormForContent = function _getStorageFormForContent (content) {
  return {
    '_id': content.getHashHex(),
    'data': content.getData(),
    'owner_username': content.getOwnerUsername(),
    'owner_address': content.getOwnerAddress(),
    'owner_pubkey': content.getOwnerPubKey(),
    'post_time': content.getPostTime(),
    'post_height': content.getPostHeight(),
    'signature': content.getSignatureHex()
  }
}

/**
 * Store content to the database.
 */
ContentStore.prototype._putContent = function _putContent (content) {
  logger.debug('ContentStore#_putContent:')
  logger.debug(JSON.stringify(content, null, 4))

  var contentForStorage = ContentStore._getStorageFormForContent(content)

  logger.debug('Storage form:')
  logger.debug(JSON.stringify(contentForStorage, null, 4))

  return q(this.db.put(contentForStorage)).get('id')

}

/**
 * Store content to the database and emit 'put' when it is stored.
 */
ContentStore.prototype.putContent = function putContent (content) {
  var pStored = this._putContent(content)
  logger.debug('ContentStore#putContent - Got storage promise:')
  logger.debug(JSON.stringify(pStored, null, 4))
  pStored.then(function (hashhex) {
    logger.debug("ContentStore#putContent - successfully stored '" + hashhex + "'")
  })
  return this.tapPromiseAndEmitResult(pStored, 'put', this)
}

/**
 * Return content of hash hashhex from the database.
 */
ContentStore.prototype.getContent = function getContent (hashhex) {
  return Content.fromObject(q(this.db.get(hashhex)))
}

/**
 * Search for content where one of the properties has a certain value. i.e.,
 * you can get content where the 'username' value is for a certain user.
 */
ContentStore.prototype._queryForContent = function _queryForContent (query, fieldsToReturn, fieldsToSortOn) {
  if (!fieldsToReturn) {
    fieldsToReturn = ['id']
  }

  var requestObj = { 'selector': query }

  if (fieldsToReturn) {
    requestObj.fieldsToReturn = fieldsToReturn
  }

  if (fieldsToSortOn) {
    requestObj.sort = fieldsToSortOn
  }

  return q(this.db.find(requestObj)).get('docs')
}

/**
 * Get content created by a certain username
 */
ContentStore.prototype.getContentByUsername = q.promised(function getContentByUsername (username) {
  if (!username || typeof (username) !== 'string' || !username.length) {
    throw new Error('ContentStore#getContentByUsername requires 1 argument, "username", which must be a non-null, defined string with length>0')
  }
  return Content.fromObjects(
    this._queryForContent({'owner_username': {'$eq': username}})
  )
})

/**
 * Get content by the user's "main" bitcoin address. TODO: It's bad practice to
 * reuse bitcoin addresses, both for security and privacy reasons. There should
 * not be a single bitcoin address associated with an account. At minimum, each
 * piece of content should have a new address associated with it, and you can
 * send bitcoin to that address. Even then we're still reusing addresses,
 * because multiple people may tip the same piece of content. There is no
 * trivial way to solve this, but we could use ECDH to each tipper to arrive at
 * a shared "address" to which only the owner has the private key, like stealth
 * addresses. That would prevent reusing bitcoin addresses.
 */
ContentStore.prototype.getContentByUserAddress = q.promised(function getContentByUserAddress (userAddress) {
  // construct Address even if already in string form to validate
  userAddress = (new bitcore.Address(userAddress)).toString()

  return Content.fromObjects(
    this._queryForContent({'owner_address': userAddress})
  )
})

ContentStore.QUERIES = {}
ContentStore.QUERIES.GET_CONTENT_HASHES = {
  'selector': {
    'owner_address': {'$exists': true}
  },
  'fields': ['_id']
}

/**
 * Get the hashes of content we have stored in the db.
 */
ContentStore.prototype.getContentHashes = function getContentHashes () {
  return q(this.db.find(ContentStore.QUERIES.GET_CONTENT_HASHES)).get('docs')
}

/**
 * Delete the entire database.
 */
ContentStore.prototype.destroyDB = function destroyDB () {
  return this.db.destroy.apply(this.db, arguments)
}

module.exports = ContentStore
