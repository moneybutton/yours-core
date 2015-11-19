---
title: Towards a Prototype 2
author: ryanxcharles
date: 2015-10-05
template: article.jade
---

I remain focused 100% on building a prototype. Here are some things that have
happened since [the update last
week](/articles/2015-09-27-towards-a-prototype/). The big picture is that a lot
of fundamental work has happened with the front-end and database, but there are
still some important things to finish before a prototype is complete,
particularly peer connections and bitcoin payments. And the most important
thing is that [we are now tracking issues and milestones properly on
GitHub](https://github.com/dattnetwork/datt/milestones), which should help
facilitate collaboration when we make another push for that.

- Got the test framework working with react, so it is possible to write tests
  for the front-end.
  [Commit](https://github.com/dattnetwork/datt/commit/276a01d4d348f5cfbe2905310be09346afeebffc).
- Added twitter bootstrap to the front-end so things have some style.
  [Commit](https://github.com/dattnetwork/datt/commit/9c01653c81b1d2bb6e30e63e8fdc5c675aa692bb).
- Add in the logo and make it look reasonable.
  [Commit](https://github.com/dattnetwork/datt/commit/2d36364ca647f285f7e7c6aad8ced0cb55369e98).
- Add info boxes - user, bitcoin, content, peers.
  [Commit](https://github.com/dattnetwork/datt/commit/75fc51fa628cb002cefe08a7b13ef2ff773eee6c).
- Make info boxes look more like Chris' design.
  [Commit](https://github.com/dattnetwork/datt/commit/e4db408909ca1b0942b7685bf4c8dbb13dfd786c).
- Refactor gulpfile to make it easier to manage.
  [Commit](https://github.com/dattnetwork/datt/commit/b0ad1fb0bfcbac64c2cc2997ff9f380fdc6dc314).
- Allow setting username in memory. The way users now work is that a master key
  is automatically generated, but you must still specify a username by hand
  (which is not guaranteed unique).
  [Commit](https://github.com/dattnetwork/datt/commit/092113639aeaaa3563dac52bb55bc84545e2f2eb).
- Add Msg data structure for p2p messages.
  [Commit](https://github.com/dattnetwork/datt/commit/7777c0163f6359fe966a54efaaeaecf8908b6903).
- Add ping and pong messages.
  [Commit](https://github.com/dattnetwork/datt/commit/150d3c0350efe9be656c0e358112e506f3589495).
- Slightly improved watching in gulpfile.
  [Commit](https://github.com/dattnetwork/datt/commit/150d3c0350efe9be656c0e358112e506f3589495).
- Add verifyCompactSig to AsyncCrypto - compact signatures are nice primiarly
  because they are always exactly 65 bytes and thus easy to parse.
  [Commit](https://github.com/dattnetwork/datt/commit/9158f899c51cea7ddea71c06e2503bea62805f56).
- Add MsgAuth - an authentication message for, basically, signing your name.
  Could be extended to support more profile information later.
  [Commit](https://github.com/dattnetwork/datt/commit/38190731616777abea3e78f46e3145e8c87c8bdf).
- Created a list of milestones and issues for the prototype on GitHub. This
  should make it easier for other people to see what are the highest-priority
  outstanding issues so they can help if they want. It will also let people
  track progress more easily if they want. [Check it out
  here](https://github.com/dattnetwork/datt/milestones).
- Display block height number in bitcoin box. We're making extensive use of the
  latest block hash and height number for authentication. Signing the latest
  block hash proves your signature is recent in a decentralized way.
  [Commit](https://github.com/dattnetwork/datt/commit/6dc5d9eb6a665de901bc066fb10f41bbfe9328f3).
- Use arrow functions where appropriate - this makes code smaller and
  eliminates bugs around the use of "bind".
  [Commit](https://github.com/dattnetwork/datt/commit/51161fda2395dfb77531aed67212089f7f68d315).
- Make views modular and some tests - iterating towards a better-architected
  and better-tested front-end.  [Commit
  1](https://github.com/dattnetwork/datt/commit/4bcce881fd54a0e530b21663480524bae6d56b62).
  [Commit
  2](https://github.com/dattnetwork/datt/commit/5e5e901453f92c30378136c23e1104ec4259df5c).
- Make it sign an auth message when you set your username. Does not yet save to
  database or broadcast.
  [Commit](https://github.com/dattnetwork/datt/commit/7e8d1dc3de74368efa67a954fb9831c6a0a6b34a).
- Add basic content type - does not yet allow for signed content.
  [Commit](https://github.com/dattnetwork/datt/commit/803133dedeb7ecb8c7b6e9938b5752959824dd65).
- Authenticated content - this is content that is signed and has a bitcoin
  address so you can pay to it.
  [Commit](https://github.com/dattnetwork/datt/commit/ce3d37f2d7365e69a63283ecb7e30677265f8543).
- Get and save content from the database.
  [Commit](https://github.com/dattnetwork/datt/commit/6fa9351376eac596fe9c2d002be190ed0d9b3c43).
- DBUser - a class for getting/setting user information from/to the database.
  [Commit](https://github.com/dattnetwork/datt/commit/7a81cf1fb55b2b0c07ad5f38d9dc6ba8a9e19825).
- CoreUser - a class for managing the state of the user, particularly master
  key and name, and being sure it is correctly saved to the database.
  [Commit](https://github.com/dattnetwork/datt/commit/adc8a8f3785374da1f379db616b24aa320de0542).
- Use CoreUser inside of dattcore - this keeps the logic of managing the user
  properly modularized.
  [Commit](https://github.com/dattnetwork/datt/commit/2c7f7351e99bef73961f2846cce4fa0cc86a1aba).
- Save user information to the database after setting the name - thus making
  sure when you refresh, your name (and master key) are still there.
  [Commit](https://github.com/dattnetwork/datt/commit/5bd7f64da0c4e23b40a4647814ee7ea8d305bcfc).
- Created a CoreBitcoin framework that doesn't yet have substance, but will be
  used to manage the bitcoin classes that query the blockchain and send
  transactions and whatnot.
  [Commit](https://github.com/dattnetwork/datt/commit/7c6806d2338c226d0121cec106b1c7e5d45c29a7).
- Prefix asynchronous get/set methods with "async" - this style choice makes it
  easier to distinguish between synchronous and asynchronous method, which must
  be used differently.
  [Commit](https://github.com/dattnetwork/datt/commit/fcf1323bc0689f875068a9a9f65088d80430cf89).

And on a not-unrelated note, I'm on my longest GitHub streak ever, with now 18
solid days in a row of commits.

Links:
- [Twitter Bootstrap CSS](http://getbootstrap.com/css/)
- [ES6 in depth on ponyfoo.com](http://ponyfoo.com/articles/tagged/es6-in-depth)
- [jesstelford/react-testing-mocha-jsdom](https://github.com/jesstelford/react-testing-mocha-jsdom)
- [Getting started with react and node.js](http://blog.yld.io/2015/06/10/getting-started-with-react-and-node-js/)
- [UI testing with react components](http://www.toptal.com/react/how-react-components-make-ui-testing-easy)
- [React testing utilities](https://facebook.github.io/react/docs/test-utils.html)
- [Approaches to testing react components](http://reactkungfu.com/2015/07/approaches-to-testing-react-components-an-overview/)
- [mocha-react](https://github.com/danvk/mocha-react)
- [Testing react with jsdom](http://jaketrent.com/post/testing-react-with-jsdom/)
