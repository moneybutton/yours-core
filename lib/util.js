var events = require('events')
var EventEmitter = events.EventEmitter
var u = require('underscore')

// TODO: Explain the purpose and value of this method.
function tapPromiseAndEmitResult (promise, eventName, emitter) {
  // You may bind this function to an EventEmitter, if you wish
  if (!emitter) {
    if (this && this instanceof EventEmitter) {
      emitter = this
    } else {
      throw new Error('tapPromiseAndEmitResult requires an EventEmitter passed as an argument or to be bound to an EventEmitter')
    }
  }

  promise.tap(function () {
    var args = u.map(arguments, function (el) { return el })
    args.unshift(eventName) // now args = [eventName, arguments[0], arguments[1], ...]

    emitter.emit.apply(emitter, args) // like emitter.emit(eventName, arguments[0], arguments[1], ...)
  })

  return promise
}

/**
 * Make an *insecure* random string. This should never be used to generate
 * private keys, but can be used to generate identifiers.
 */
function _randomString (nchars) {
  // Credit: http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
  return (Math.random().toString(36) + '00000000000000000').slice(2, nchars + 2)
}

module.exports.tapPromiseAndEmitResult = tapPromiseAndEmitResult
module.exports._randomString = _randomString
