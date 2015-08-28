var bitcore = require('bitcore')
var q = require('q')
var u = require('underscore')

function Content (data, owner_username, owner_address, post_time, post_height, owner_pubkey, signature) {
  this.data = data
  this._owner_username = q(owner_username)
  this._owner_address = q(owner_address)
  this._owner_pubkey = q(owner_pubkey)
  this.post_time = post_time
  this.post_height = post_height
  this._signature = q(signature)
  console.log('Content')
}

Content.prototype.init = function () {
  console.log('Content#init')
  // set public key and address and verify consistency
  if (this._readyPromise) {
    return this._readyPromise
  }

  var pUsername = this._owner_username.then((function (username) {
    return (this.owner_username = username)
  }).bind(this))

  var pPubKey = this.setOwnerPubKey(this._owner_pubkey)
  var pOwnerAddress = this.setOwnerAddress(this._owner_address)
  // set signature (if provided) and verify consistency with above

  this._readyPromise = q.when(pUsername, pPubKey, pOwnerAddress).then((function () {
    delete this._owner_username
    delete this._owner_pubkey
    delete this._owner_address
    var pSig = this.setSignature(this._signature)
    return pSig.then((function () {
      delete this._signature
      return this
    }).bind(this))
  }).bind(this))

  return this._readyPromise

}

Content.fromDataAndUser = function fromDataAndUser (data, user, post_time, post_height) {
  return user.then(function () {
    console.log('Content@fromDataAndUser: user ready')
    var content = new Content(data, this.getUsername(), this.getAddress(), post_time, post_height, this.getPubKey(), this.sign(data))

    return content.init().then(function () {
      console.log('Content@fromDataAndUser: content ready')
      return content
    })
  })
}

Content.prototype.setOwnerPubKey = function setOwnerPubKey (pubkey) {
  return q(pubkey).then((function (pubkey) {
    console.log('Content#setOwnerPubKey: ' + pubkey)
    if (!pubkey) {
      return q.resolve(null)
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

    // if (!this.owner_address) {
    // 	  this.setOwnerAddress(expected_address)
    // }

    console.log("Content#setOwnerPubKey: set owner pub key = '" + pubkey + "'")
    return q(this.owner_pubkey)
  }).bind(this))
}

Content.prototype.getOwnerPubKey = function getOwnerPubKey () {
  return this.owner_pubkey
}

Content.prototype.setOwnerAddress = function setOwnerAddress (address) {
  return q(address).then((function (address) {
    console.log('Content#setOwnerAddress: ' + address)
    if (!address) {
      return q.resolve(null)
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

    return q(this.owner_address)
  }).bind(this))
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
  newSig = q(newSig)
  console.log('Content#setSignature')
  return newSig.then((function (sig) {
    if (!sig) {
      return q.resolve(null)
    }
    console.log("Content#setSignature - signature ready: '" + sig + "'")
    if (sig && sig instanceof Buffer) {
      sig = bitcore.crypto.Signature.fromBuffer(sig).toString()
    }
    if (sig && typeof (sig) === 'object') {
      sig = sig.toString()
    }
    if (sig && typeof (sig) !== 'string') {
      sig = sig.toString()
    }

    // sig should be a string now, so let's just make sure we check if it's a valid signature
    if (sig) {
      sig = bitcore.crypto.Signature.fromString(sig).toString()
    }

    var ownerPubKey = this.getOwnerPubKey()

    // var thisData = this.getData()
    // if (sig && ownerPubKey && thisData && !Content.verifySignature(thisData, sig, ownerPubKey)) {
    //   // public key, data, and signature are inconsistent!
    //   // throw an error!
    // 	var errMsg = 'Content#setSignature cannot set a signature which is incompatible with the data and public key associated with the content!'
    // 	console.error(errMsg)
    //   throw new Error(errMsg)
    // }

    this.signature = sig

    console.log("Content#setSignature: set '" + this.signature + "'")
    return q(this.signature)

  }).bind(this))

}

Content.prototype.getSignature = function getSignature () {
  return (this.signature ? this.signature.toString() : undefined)
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
  return (this.post_time ? this.post_time.toString() : undefined)
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
  } else if (signature instanceof Buffer) {
    signature = bitcore.crypto.Signature.fromBuffer(signature)
  }

  var hash = bitcore.crypto.Hash.sha256(data)

  return bitcore.crypto.ECDSA.verify(hash, signature, publicKey)
}

Content.serialize = function serialize (content) {
  if (!content || !content.serialize || typeof (content.serialize) !== 'function') {
    throw new Error('Content.serialize requires non-null Content instance as first argument')
  } else {
    var censoredContent = u.pick(content, ['data', 'owner_username', 'owner_pubkey', 'owner_address', 'post_time', 'post_height', 'signature'])
    return JSON.stringify(censoredContent)
  }
}

module.exports = Content
