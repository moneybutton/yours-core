Document All The Things
=======================

## Log

### Hackathon Day 1, July 31, 2015

In just two days of invites, we've managed to gather 59 people to join the
Slack channel!

Priorities:

- Establish minimal product plan, including mockups (subject to change, of
  course, depending on technical choices and UI decisions - the goal is to just
  come up with something minimal that provides a good direction for the UI).

- Research technologies, and establish basic technologies for a prototype
  (technologies are subject to change - there are a lot to choose from, and we
  haven't had time to research them all yet).

- Establish basic business plan. Although the network is decentralized, there
  are still lots ways to earn money, because each node can accept payments. The
  business plan doesn't have to be final, but rather more of an example of the
  way a business might be able to earn money from running a node.

## Resources and related projects

- aether - http://getaether.net/
- empeopled - https://empeopled.com
- colony - colony.io
- backfeed - backfeed.cc
- http://lazooz.org/
- http://www.decent.ch/ 

Resources compiled by John Villar
- [PeerJS](http://peerjs.com/) - Easy WebRTC
- [FreedomJS](http://www.freedomjs.org/) - Another Easy WebRTC
- [GUN.js](http://gun.js.org/) - NoDB High replication memcache
- [PouchDB](http://pouchdb.com/) - A clientside CouchDB-like database that syncs when online with a CouchDB server
- [WebTorrent](https://github.com/feross/webtorrent) - Torrent, for HTML5
- [MaidSafe](http://maidsafe.net/) - A blockchained coin/storage
- [BitcoinJS](http://bitcoinjs.org/) - Bitcoin's JS Swiss knife
- [Coinspark](http://coinspark.org/) - Smart contracts on the blockchain (non-js)
- [Codius](https://codius.org/) - Smart contracts on the blockchain (js)
- [Key-hq](https://www.npmjs.com/package/key-hq) - BIP32 compliant HD keychain
- [Bitcore](https://github.com/bitpay/bitcore) - bitpay's javascript implementation of bitcoin
- [bcoin](https://github.com/indutny/bcoin) - chjj's implementation - has SPV support in node
- [fullnode](https://github.com/ryanxcharles/fullnode) - ryanxcharles's implementation - similar codebase to bitcore, but monolithic, and written in ES 2015
- [webcoin](https://github.com/mappum/webcoin) - an SPV node that works in a browser, based on bitcore
- [Bitmessage](https://bitmessage.org/wiki/Main_Page) - Blockchain specifically dedicated to messaging, think SPV client but with messages, anonymous identities and proof of work message requirement (non-js).
- [NPM Bitmessage](https://www.npmjs.com/package/bitmessage) - Bitmessage Node.js implementation supporting browserify, alpha quality, still no outgoing connection on browser.
- [Bitmessage-node](https://github.com/RexMorgan/bitmessage-node) - Bitmessage API library, piggybacks on native Bitmessage installation
- [BitID](https://github.com/bitid/bitid) - Public key based authentication using Bitcoin Wallets facilities
- [Blockstack](http://blockstack.org/) - Very similar project to Datt
- [Ephemeral](https://github.com/losvedir/ephemeral2) - Ephemeral content stored only by the viewers of it
- [UX Methods &amp; Design](http://uxdesign.cc/ux-methods-deliverables/) - UX/UI design cheatsheet

Articles
- [The Cryptographic Doom Principle - you should always encrypt then mac - validate mac before decrypting data](http://www.thoughtcrime.org/blog/the-cryptographic-doom-principle/)
- [Web RTC STUN and TURN](http://www.html5rocks.com/en/tutorials/webrtc/infrastructure/)
- https://valme.io/c/journal/c_prompt/f5qqs/an-open-letter-to-steve-huffman-reddits-new-ceo-with-an-offer-to-exchange-values (general business model ideas)
- http://valme.io/c/gettingstarted/faq/nqqqs/why-does-it-cost-1-karma-to-upvote-but-2-to-downvote (related to downvoting)
- http://valme.io/c/gettingstarted/faq/yqqqs/whats-a-sponsored-account (related to allowing mods to change the price of content)
- http://valme.io/c/gettingstarted/faq/7mqqs/valme-transaction-costs (related to different transaction fees for different actions)
- http://valme.io/c/gettingstarted/faq/5qqqs/whats-a-modqueue-what-are-moderators-mods (related to flagging/downvote brigades)

## Brainstorms and thoughts

### Thoughts from Niran:

- Using money for upvotes isn't really a feature. It's not necessary to
  decentralize reddit. What is wrong with reddit that money fixes?

- Subreddits, not tags. Tags mean one submission has several audiences with one
  comments section. Subreddits divide comments in very useful ways. The
  moderators define not just the submissions, but the culture of the comments.

- Users should be able to pick their own moderators for a subreddit. A
  subreddit is a topic and an ethos, but that's orthogonal to who the enforcers
  of the topic and ethos are.

- Maybe each moderator is effectively a publisher of the entire subreddit.
  Filtering out garbage content happens on their machine, assisted by rule sets
  like user bans, anonymity bans, trusted commenters, and trusted fellow
  moderators to import rule sets from. They publish their results to a
  decentralized content store, like IPFS or Swarm.

- I think it's going to be useful to think of the backends of decentralized
  applications as two parts: live data that users send to participate in the
  system, and servers that collect that data, index it in useful ways, and
  serve it over read -only APIs. It probably isn't feasible for each client to
  piece together all the votes and submissions to generate a subreddit, but as
  long as anyone can launch a server that does that, the promise of
  decentralization is maintained. If the server relays submissions of votes,
  comments and submissions to the decentralized backend that the system runs
  on, this also avoids the dependency on a local daemon that many decentralized
  tools. Hosting one of these servers is a small to medium opportunity for
  profit.

- Ethereum, Whisper and Swarm/IPFS. Using the best toolkit for decentralized
  applications is a huge advantage. It makes it less likely that someone will
  start a new decentralized reddit project that isn't a benevolent fork of this
  one. One of the huge advantages of decentralized apps is that if built right,
  the user base never splits even with competition. Each competitor builds on
  top of what already exists to benefit from the existing user base. That won't
  happen if your system is hard to build on.

- You probably only need a blockchain (Ethereum's, hopefully) for a tiny
  fraction of the functionality. The identity of each subreddit probably needs
  to be on a blockchain so it's easy to pull down all of them. Once you have a
  subreddit identity, you can just listen for people broadcasting data for that
  subreddit over Whisper: moderator candidates, new comments, posts and votes,
  the location of historical indices, etc.
