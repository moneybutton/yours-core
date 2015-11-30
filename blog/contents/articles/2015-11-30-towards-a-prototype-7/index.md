---
title: Towards a Prototype 7
author: ryanxcharles
date: 2015-11-30
template: article.jade
---

We're very close to reaching the [prototype
milestone](https://github.com/dattnetwork/datt/milestones/Prototype). Of the 47
issues created for the prototype milestone, only 6 remain unfinished. They all
have to do with actually making a payment to a piece of content.

Some things that actually work right now are:
- When you open the app, if you do not already have an identity, an identity is
  automatically generated for you.
- You will automatically be connected to all available peers.
- When you post a piece of content, it is signed with your master key, stored
  in the database, and broadcast to all peers.
- You can "set" your name, which is another type of message that is broadcast
  to all peers.
- When you receive a piece of content, the app validates the content, which
  includes validating the signature. If valid, it is displayed.
- The app has a built-in BIP 44 bitcoin wallet that can generate new addresses.
  Each piece of content has a new address associated with it.
- The app is connected to a blockchain API which is used to query the latest
  block information. The concept of signing the latest block, which proves in a
  decentralized manner that a signature is recent, is used for all signatures.
  The blockchain API will also be used to query balance information and
  broadcast transactions once those parts are functional.
- Workers are used to keep the cryptography out of the main thread.
- All the code, except the networking code, works both in node and the browser.
  Some placeholder code is there to make things work in node at a later date
  (basically, by using web sockets instead of web RTC).

Assuming I can finish the "actually send a payment" piece this week, then
theoretically this will be the last blog post that is "towards a prototype" and
the next one will be "post-prototype".

The general plan after the prototype is finished is to explicitly start seeking
out cofounders. I will primarily be looking for an engineering cofounder, since
engineering is the thing where I most need help. I will also be looking for a
business operations cofounder, but that is less urgent than the engineering
cofounder. In order to help with the search, I will probably be advertising the
existence of the prototype by writing about it and possibly discussing it with
media.

The next milestone after the prototype is the
[MVP](https://github.com/dattnetwork/datt/milestones/MVP). The MVP is basically
where we take the prototype and try to turn it into the most minimal product
that can actually be launched to real users. The prototype just has all the
basic technology in place - but the MVP actually uses the technology in an
intelligent, albeit minimal way to actually create value for end users.

If you are interested in contributing to Datt, please [join our Slack
channel](http://datt-slackin.herokuapp.com/). The most important thing right
now is simply writing the software. However, there are lots of other ways to
contribute, including expanding on our business, community, product and
technology plans. Also feel free to contribute to
[fullnode](https://github.com/ryanxcharles/fullnode), which is used extensively
throughout Datt.

If you just want to follow Datt, then you can follow this blog, and
[twitter](https://twitter.com/dattnetwork), and [sign up for our mailing list
at the bottom of datt.co](http://datt.co/).
