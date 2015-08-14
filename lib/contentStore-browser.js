/** STUB: to be implemented using IndexedDB **/
var q = require('q')
var bitcore = require('bitcore')

function ContentStore () {
  this.db = localStorage
}

// returns a promise to the hash of put content
ContentStore.prototype.putContent = function putContent (content) {
  var hashhex = bitcore.crypto.Hash.sha256(new Buffer(content, 'utf8')).toString('hex')
  this.db[hashhex] = content
  var deferred = q.defer()
  deferred.resolve(hashhex)
  return deferred.promise
}

// returns a promise to the content of id hashhex
ContentStore.prototype.getContent = function getContent (hashhex) {
  var content = this.db[hashhex]
  var deferred = q.defer()
  deferred.resolve(content)
  return deferred.promise
}

module.exports = ContentStore
