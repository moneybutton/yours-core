/** STUB: to be implemented using IndexedDB **/
var bitcore = require('bitcore')

function ContentStore () {
  this.db = localStorage
}

ContentStore.prototype.putContent = function putContent (content) {
  var hash = bitcore.crypto.Hash.sha256(new Buffer(content, 'utf8')).toString('hex')
  this.db[hash] = content
  return hash
}

ContentStore.prototype.getContent = function getContent (hash) {
  return this.db[hash]
}

module.exports = ContentStore
