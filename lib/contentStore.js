/** imports **/
var util = require('util')
var events = require('events')
var Content = require('./content')

var q = require('q')

var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
PouchDB.debug.enable('*')

var bitcore = require('bitcore')

var DattUtil = require('./util')

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
  var self = this
  console.log("DB NAME: '" + this._dbName + "'")

  this.db = new PouchDB(this._dbName)
  console.log(this.db.adapter || this.db.db)

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

  return q.all([ownerUsernameIndexPromise, ownerAddressIndexPromise]).then((function (values) {
    var args = values

    args.unshift('ready')

    self.emit.apply(self, args)

    return this
  }).bind(this))
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
  console.log('ContentStore#_putContent:')
  console.log(JSON.stringify(content, null, 4))

  var contentForStorage = ContentStore._getStorageFormForContent(content)

  console.log('Storage form:')
  console.log(JSON.stringify(contentForStorage, null, 4))

  return q(this.db.put(contentForStorage)).get('id')

}

ContentStore.prototype.putContent = function putContent (content) {
  var pStored = this._putContent(content)
  console.log('ContentStore#putContent - Got storage promise:')
  console.log(JSON.stringify(pStored, null, 4))
  pStored.then(function (hashhex) {
    console.log("ContentStore#putContent - successfully stored '" + hashhex + "'")
  })
  return this.tapPromiseAndEmitResult(pStored, 'put')
}

ContentStore.prototype.getContent = function getContent (hashhex) {
  return Content.fromObject(q(this.db.get(hashhex)))
}

ContentStore.prototype._queryForContent = function _queryForContent (query, fieldsToReturn, fieldsToSortOn) {
  if (!fieldsToReturn) { fieldsToReturn = ['id'] }

  var requestObj = {
    'selector': query,
    'fields': fieldsToReturn,
    'sort': fieldsToSortOn
  }

  return q(this.db.find(requestObj)).get('docs')
}

ContentStore.prototype.getContentByUsername = function getContentByUsername (username) {
  return this._queryForContent({'owner_username': username})
}

ContentStore.prototype.getContentByUserAddress = function getContentByUserAddress (userAddress) {
  // construct Address even if already in string form to validate
  userAddress = (new bitcore.Address(userAddress)).toString()

  return this._queryForContent({'owner_address': userAddress})
}

ContentStore.prototype.getContentHashes = function getContentHashes () {
  return q(this.db.allDocs()).get('docs')
}

ContentStore.prototype.destroyDB = function destroyDB () {
  return this.db.destroy.apply(this.db, arguments)
}

module.exports = ContentStore
