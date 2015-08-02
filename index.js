/**
  * datt
  * ====
  *
  * The entry point to the datt application, which both runs in node and in a
  * browser (if browserified).
  */
"use strict";
let datt = module.exports;

datt.version = require('./package').version;

datt.Msg = require('./lib/msg');

// Mainnet classes for your convenience (in case default is not what you want).
let Mainnet = {};
Object.keys(datt).forEach(function(key) {
  Mainnet[key] = datt[key].Mainnet ? datt[key].Mainnet : datt[key];
});

// Testnet classes for your convenience (in case default is not what you want).
let Testnet = {};
Object.keys(datt).forEach(function(key) {
  Testnet[key] = datt[key].Testnet ? datt[key].Testnet : datt[key];
});

datt.Mainnet = Mainnet;
datt.Testnet = Testnet;
