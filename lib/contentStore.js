/** imports **/
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

/** end imports **/

function ContentStore (options) {
  this.db = undefined

  options = options || {}
  if (typeof (options) === 'string') {
    options = {'dbName': options}
  }

  this._dbName = options.dbName || 'datt-db-content'
  this._clearDbOnStart = options._clearDbOnStart
}

util.inherits(ContentStore, events.EventEmitter)

ContentStore.prototype.tapPromiseAndEmitResult = DattUtil.tapPromiseAndEmitResult

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

ContentStore.prototype._putContent = function _putContent (content) {
  logger.debug('ContentStore#_putContent:')
  logger.debug(JSON.stringify(content, null, 4))

  var contentForStorage = ContentStore._getStorageFormForContent(content)

  logger.debug('Storage form:')
  logger.debug(JSON.stringify(contentForStorage, null, 4))

  return q(this.db.put(contentForStorage)).get('id')

}

ContentStore.prototype.putContent = function putContent (content) {
  var pStored = this._putContent(content)
  logger.debug('ContentStore#putContent - Got storage promise:')
  logger.debug(JSON.stringify(pStored, null, 4))
  pStored.then(function (hashhex) {
    logger.debug("ContentStore#putContent - successfully stored '" + hashhex + "'")
  })
  return this.tapPromiseAndEmitResult(pStored, 'put', this)
}

ContentStore.prototype.getContent = function getContent (hashhex) {
  return Content.fromObject(q(this.db.get(hashhex)))
}

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

ContentStore.prototype.getContentByUsername = q.promised(function getContentByUsername (username) {
  if (!username || typeof (username) !== 'string' || !username.length) {
    throw new Error('ContentStore#getContentByUsername requires 1 argument, "username", which must be a non-null, defined string with length>0')
  }
  return Content.fromObjects(
    this._queryForContent({'owner_username': {'$eq': username}})
  )
})

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

ContentStore.prototype.getContentHashes = function getContentHashes () {
  return q(this.db.find(ContentStore.QUERIES.GET_CONTENT_HASHES)).get('docs')
}

ContentStore.prototype.destroyDB = function destroyDB () {
  return this.db.destroy.apply(this.db, arguments)
}

module.exports = ContentStore
