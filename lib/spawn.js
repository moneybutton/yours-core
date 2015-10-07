// See: https://gist.github.com/jakearchibald/31b89cba627924972ad6
'use strict'
function spawn (generatorFunc) {
  function continuer (verb, arg) {
    var result
    try {
      result = generator[verb](arg)
    } catch (err) {
      return Promise.reject(err)
    }
    if (result.done) {
      return result.value
    } else {
      return Promise.resolve(result.value).then(onFulfilled, onRejected)
    }
  }
  var generator = generatorFunc()
  var onFulfilled = continuer.bind(continuer, 'next')
  var onRejected = continuer.bind(continuer, 'throw')
  return onFulfilled()
}
module.exports = spawn
