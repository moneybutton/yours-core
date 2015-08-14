/** STUB: to be implemented using LevelDB **/
var q = require('q')
var bitcore = require('bitcore')
var levelup = require('levelup')
// TODO: replace memdown with leveldown, and make tests use memdown for speed
var db = levelup('/some/location', { db: require('memdown') })

function ContentStore () {
}

// returns a promise to the hash of put content
ContentStore.prototype.putContent = function putContent (content) {
  var hash = bitcore.crypto.Hash.sha256(new Buffer(content, 'utf8'))
  return q.nbind(db.put, db)(hash, content).then(function () {
    return hash.toString('hex')
  })
}

// returns a promise to the content of id hashhex
ContentStore.prototype.getContent = function getContent (hashhex) {
  var hash = new Buffer(hashhex, 'hex')
  console.log('getting ' + hashhex)
  return q.nbind(db.get, db)(hash)
}

module.exports = ContentStore
