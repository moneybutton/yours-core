/** STUB: to be implemented using IndexedDB **/
var q = require('q')
var bitcore = require('bitcore')

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

function ContentStore () {
  this.db = undefined
}

ContentStore.prototype.init = function init () {
  var DBOpenRequest = window.indexedDB.open('datt-test', 5)

  var deferred = q.defer()

  // these two event handlers act on the database being opened successfully, or not
  DBOpenRequest.onerror = function (event) {
    deferred.reject(new Error('Error opening the database'))
  }

  DBOpenRequest.onsuccess = function (event) {
    this.db = DBOpenRequest.result
    deferred.resolve()
  }.bind(this)

  DBOpenRequest.onupgradeneeded = function (event) {
    var db = event.target.result
    this.db = db
    db.createObjectStore('datt-test-store-3', { keyPath: 'hashhex' })
  }.bind(this)

  return deferred.promise
}

// returns a promise to the hash of put content
ContentStore.prototype.putContent = function putContent (content) {
  var hashbuf = bitcore.crypto.Hash.sha256(new Buffer(content, 'utf8'))
  var hashhex = hashbuf.toString('hex')
  var deferred = q.defer()

  var transaction = this.db.transaction(['datt-test-store-3'], 'readwrite')

  transaction.oncomplete = function (event) {
    // Transaction opened
  }

  transaction.onerror = function (event) {
    deferred.reject(new Error('Could not create database transaction'))
  }

  var objectStore = transaction.objectStore('datt-test-store-3')

  var objectStoreRequest = objectStore.put({
    hashhex: hashhex,
    content: content
  })

  objectStoreRequest.onsuccess = function (event) {
    deferred.resolve(hashhex)
  }

  objectStoreRequest.onerror = function (event) {
    deferred.reject(new Error('Could not store data in the database'))
  }

  return deferred.promise
}

// returns a promise to the content of id hashhex
ContentStore.prototype.getContent = function getContent (hashhex) {
  var deferred = q.defer()

  var transaction = this.db.transaction(['datt-test-store-3'], 'readwrite')

  transaction.oncomplete = function (event) {
    // Transaction opened
  }

  transaction.onerror = function (event) {
    deferred.reject(new Error('Could not create database transaction'))
  }

  var objectStore = transaction.objectStore('datt-test-store-3')

  var objectStoreRequest = objectStore.get(hashhex)

  objectStoreRequest.onsuccess = function (event) {
    var content = objectStoreRequest.result.content
    deferred.resolve(content)
  }

  objectStoreRequest.onerror = function (event) {
    deferred.reject(new Error('Could not store data in the database'))
  }

  return deferred.promise
}

module.exports = ContentStore
