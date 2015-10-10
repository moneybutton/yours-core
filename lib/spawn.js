/**
 * spawn
 * =====
 *
 * This is a tool for repeatedly calling the .thens of promises yielded by a
 * generator. Basically, this makes it possible to write asynchronous,
 * promisified code with normal try/catches that look just like synchronous
 * code. It creates shorter and easier to understand code. Hypothetically,
 * there will be a feature in the next version of javascript, ES7, called
 * "async functions", which do exactly what spawn does. When/if that happens
 * and we can access it in node, we can simply remove all calls to spawn and
 * our code should behave in the same way.
 *
 * See:
 * https://github.com/lukehoban/ecmascript-asyncawait
 * https://gist.github.com/jakearchibald/31b89cba627924972ad6
 * http://www.html5rocks.com/en/tutorials/es6/promises/
 * https://github.com/tc39/ecmascript-asyncawait
 * http://tc39.github.io/ecmascript-asyncawait/
 */
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
