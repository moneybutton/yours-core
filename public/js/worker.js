importScripts('/js/sha3.js');

onmessage = function(e) {
  console.log('received work!');

  var date = (new Date()).yyyymmdd();
  var bits = 0;
  var rand = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

  var name = e.data[0];
  var difficulty = e.data[1];

  for (var counter = 0; bits < difficulty; counter++) {
    var chunks = [
      '2', // Hashcash version number.  Note that this is 2, as opposed to 1.
      difficulty, // asserted number of bits that this cash matches
      'sha3', // ADDITION FOR VERSION 2: specify the hash function used
      date, // YYYYMMDD format.  specification doesn't indicate HHMMSS or lower?
      name, // Input format protocol change, recommend casting any input to hex.
      '', // empty "meta" field
      rand, // random seed
      counter // our randomized input, the nonce (actually sequential)
    ];
    var cash = chunks.join(':');
    hash = CryptoJS.SHA3(cash).toString();
    var match = hash.match(/^(0+)/);
    bits = (match) ? match[0].length : 0;
  }

  postMessage(cash);

  close();
}

Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy + (mm[1]?mm:'0'+mm[0]) + (dd[1]?dd:'0'+dd[0]); // padding
};
