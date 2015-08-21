var bitcore = require('bitcore')

function Content (data, owner_username, owner_address, post_time, post_height, owner_pubkey, signature) {
  this.data = data

  this.owner_username = owner_username

  // set public key and address and verify consistency
  this.setOwnerPubKey(owner_pubkey)
  this.setOwnerAddress(owner_address)

  this.post_time = post_time
  this.post_height = post_height

  // set signature (if provided) and verify consistency with above
  this.setSignature(signature)
}

Content.fromDataAndUser = function fromDataAndUser (data, user, post_time, post_height) {
  var content = new Content(data, user.getUsername(), user.getAddress(), post_time, post_height, user.getPubKey(), user.sign(data))
  return content
}

Content.prototype.setOwnerPubKey = function setOwnerPubKey (pubkey) {
  if (!pubkey) {
    return
  // throw new Error("Content#setOwnerPubKey requires non-null, defined argument containing public key of owner")
  }

  if (typeof (pubkey) !== 'string') {
    pubkey = (new bitcore.PublicKey(pubkey)).toString()
  }

  var expected_address = (new bitcore.PublicKey(pubkey)).toAddress().toString()

  if (this.owner_address && this.owner_address !== expected_address) {
    throw new Error("Content#setOwnerPubKey encountered existing 'owner_address' field with incompatible value: expected '" + expected_address + "' but found '" + this.owner_address + "'")
  }

  this.owner_pubkey = pubkey

  if (!this.owner_address) {
    this.setOwnerAddress(expected_address)
  }

}

Content.prototype.getOwnerPubKey = function getOwnerPubKey () {
  return this.owner_pubkey
}

Content.prototype.setOwnerAddress = function setOwnerAddress (address) {
  if (!address) {
    return
  // throw new Error("Content#setOwnerAddress requires non-null, defined argument containing address of owner")
  }

  // Need to do this, even if already string, just for validation
  address = (new bitcore.Address(address)).toString()

  if (this.owner_pubkey) {
    var owner_pubkey_generated_address = (new bitcore.PublicKey(this.owner_pubkey)).toAddress().toString()
    if (owner_pubkey_generated_address !== address) {
      throw new Error("Content#setOwnerAddress encountered existing 'owner_pubkey' field with value incompatible with new 'owner_address' value: proposed 'owner_address' is '" + address + "', but existing 'owner_pubkey' ('" + this.owner_pubkey + "') generates other address '" + owner_pubkey_generated_address + "'")
    }
  }
  this.owner_address = address

}

Content.prototype.serialize = function serialize () {
  return Content.serialize(this)
}

Content.prototype.getData = function getData () {
  return this.data
}

Content.prototype.getDataBuffer = function getDataBuffer () {
  return new Buffer(this.getData(), 'utf8')
}

Content.prototype.setSignature = function setSignature (newSig) {
  if (newSig && newSig instanceof Buffer) {
    newSig = bitcore.crypto.Signature.fromBuffer(newSig).toString()
  }
  if (newSig && typeof (newSig) === 'object') {
    newSig = newSig.toString()
  }
  if (newSig && typeof (newSig) !== 'string') {
    newSig = newSig.toString()
  }

  // newSig should be a string now, so let's just make sure we check if it's a valid signature
  if (newSig) {
    newSig = bitcore.crypto.Signature.fromString(newSig).toString()
  }

  var ownerPubKey = this.getOwnerPubKey()
  var thisData = this.getData()

  if (newSig && ownerPubKey && thisData && !Content.verifySignature(thisData, newSig, ownerPubKey)) {
    // public key, data, and signature are inconsistent!
    // throw an error!
    throw new Error('Content#setSignature cannot set a signature which is incompatible with the data and public key associated with the content!')
  }

  this.signature = newSig
}

Content.prototype.getSignature = function getSignature () {
  return ( this.signature ? this.signature.toString() : undefined)
}

Content.prototype._getSignatureObject = function _getSignatureObject () {
  return bitcore.crypto.Signature.fromString(this.getSignature())
}

Content.prototype.getSignatureBuffer = function getSignatureBuffer () {
  return this._getSignatureObject().toBuffer()
}

Content.prototype.getSignatureHex = function getSignatureHex () {
  return this.getSignatureBuffer().toString('hex')
}

Content.prototype.getOwnerUsername = function getOwnerUsername () {
  return this.owner_username
}

Content.prototype.getOwnerAddress = function getOwnerAddress () {
  return this.owner_address
}

Content.prototype.getOwnerPubKey = function getOwnerPubKey () {
  return this.owner_pubkey
}

Content.prototype.getPostHeight = function getPostHeight () {
  return this.post_height
}

Content.prototype.getPostTime = function getPostTime () {
  return (this.post_time? this.post_time.toString() : undefined)
}

Content.prototype.getOwnerBuffer = function getOwnerBuffer () {
  // return new Buffer(this.getOwnerAddress(), 'utf8')
  return new Buffer(this.getOwnerPubKey(), 'utf8')
}

Content.prototype.getBufferToHash = function getBufferToHash () {
  // var buffer = this.getDataBuffer()
  var buffer = Buffer.concat([this.getDataBuffer(), this.getOwnerBuffer(), this.getSignatureBuffer()])
  return buffer
}

Content.prototype.getHashBuffer = function getHash () {
  var hashbuf = bitcore.crypto.Hash.sha256(this.getBufferToHash())

  return hashbuf
}
Content.prototype.getHash = Content.prototype.getHashBuffer

Content.prototype.getHashHex = function getHashHex () {
  return this.getHash().toString('hex')
}

Content.prototype.validate = function validate () {
  return Content.validate(this)
}

Content.validate = function validate (content) {
  if (!content || !content.getHash() || !content.getOwnerAddress() || !content.getOwnerUsername() || !content.getSignature() || !content.getData()) {
    return false
  }

  return Content.verifySignature(content.getData(), content.getSignature(), content.getOwnerPubKey())

}

Content.verifySignature = function verifySignature (data, signature, publicKey) {
  if (!data || !signature || !publicKey) {
    throw new Error('Content.verifySignature requires 3 defined, non-null arguments: data, signature, and publicKey')
  }

  if (typeof (data) === 'string') {
    data = new Buffer(data, 'utf8')
  }

  if (typeof (publicKey) === 'string' || publicKey instanceof Buffer) {
    publicKey = new bitcore.PublicKey(publicKey)
  }

  if (typeof (signature) === 'string') {
    signature = bitcore.crypto.Signature.fromString(signature)
  } else if ( signature instanceof Buffer) {
    signature = bitcore.crypto.Signature.fromBuffer(signature)
  }

  var hash = bitcore.crypto.Hash.sha256(data)

  return bitcore.crypto.ECDSA.verify(hash, signature, publicKey)
}

Content.serialize = function serialize (content) {
  if (!content || !content.serialize || typeof (content.serialize) !== 'function') {
    throw new Error('Content.serialize requires non-null Content instance as first argument')
  } else {
    return JSON.stringify(content)
  }
}

module.exports = Content
