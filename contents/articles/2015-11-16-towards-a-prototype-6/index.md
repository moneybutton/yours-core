---
title: Towards a Prototype 6
author: ryanxcharles
date: 2015-11-16
template: article.jade
---

Since the [last
update](/articles/2015-11-01-three-months-presentations-towards-a-prototype-5/):

- The p2p code has been properly integrated into the UI making it possible to
  post data that is seen immediately by other users connected to the same
  rendezvous server. Although the p2p protocol is far from complete, it is good
  enough for a prototype.
- Andrew DeSantis and I conducted an impromptu test of Datt across the internet
  and realized it was the [First Across The Internet Test of
  Datt](https://twitter.com/desantis/status/665710047822000130), which got some
  attention on reddit and drew in more people to our community.
- The basics of a BIP44 bitcoin wallet are now being built into the
  application. The only outstanding issues between here and the prototype are
  to fully integrate the wallet so that users can actually send bitcoin to each
  post. See
  [bip44-wallet.js](https://github.com/dattnetwork/datt/blob/3b9ae999523f1e2cc84152ff97328783435bc835/core/bip44-wallet.js)
  and
  [bip44-account.js](https://github.com/dattnetwork/datt/blob/3b9ae999523f1e2cc84152ff97328783435bc835/core/bip44-account.js).
- We got attention in [Inside
  Bitcoins](http://insidebitcoins.com/news/datt-combines-social-media-with-bitcoin-powered-incentives/35619),
  [Bitcoin
  Magazine](https://bitcoinmagazine.com/articles/former-reddit-cryptocurrency-engineer-explains-how-his-decentralized-bitcoin-powered-social-media-platform-will-work-1447091607),
  [8btc (Chinese)](http://www.8btc.com/reddit-datt), and [The
  Merkle](http://themerkle.com/news/turkey-blocks-reddit-access-decentralized-social-networks-are-needed/).
  I am keeping track of press links [on
  dattdocs](https://github.com/dattnetwork/dattdocs/blob/master/general/links.md#press-for-datt).
  All of this attention seems to be an indirect result of the presentation I
  gave at the SF Bitcoin Meetup in late October.

And a note on contributions. People sometimes come to me and ask how to help
with this project. The most valuable thing anyone can do right now is help
program the prototype. Since the project is somewhat complex and unusual (being
a decentralized web app), and rapidly evolving, it is not trivial for even
experienced engineers to do this. So if you want to help, please be prepared to
spend at least a day just reading the source code before you will be able to
contribute. Then check out our
[issues](https://github.com/dattnetwork/datt/issues) and
[milestones](https://github.com/dattnetwork/datt/milestones) for a bit of a
guide about what to work on. If you are willing to do that, it would be
extremely helpful. :)
