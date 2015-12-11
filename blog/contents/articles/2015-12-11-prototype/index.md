---
title: Prototype
author: ryanxcharles
date: 2015-12-11
template: article.jade
---

A little over four months since the global hackathon that kickstarted
development of Datt ([1](/articles/2015-07-31-hackathon-day-one/),
[2](/articles/2015-08-02-hackathon-day-three/),
[3](http://www.meetup.com/blockchainU/events/224266192/)), I'm happy to
announce that last night I closed the last issue on the [prototype
milestone](https://github.com/dattnetwork/datt/issues?q=milestone%3APrototype).
This means that all the basic technical pieces of Datt are now in place,
including cryptoidentities (which are identities based on a master keypair that
is held client-side), a bitcoin wallet (these private keys are held client-side
as well), p2p content sharing (over Web RTC), and p2p payments (bitcoin, of
course). You can post a piece of content, which is seen by others. You can also
pay a piece of content, and the author will receive the payment.

Datt v0.1.0, the prototype, has the following properties:
- Identities are the master keypair of a
  [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) +
  [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
  hierarchical deterministic key set. In the future we may want to set the
  "identity" keypair to be a different keypair in the chain than the master
  one, but for now it is the master.
- There is an integrated
  [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
  bitcoin wallet based on the same hierarchy of BIP39 + BIP32 keys. The "first"
  or "main" account is the only account used to generate addresses.
- Users connect p2p over Web RTC. A user will automatically connect to all
  peers on the same rendezvous server.
- Users can set their name, which means they broadcast a signed message
  specifying what their name is.
- Users can post content, which means they broadcast a signed message with a
  title, body (markdown formatted) and label.
- When a user receives content, they validate the message before displaying it.
- Users can deposit money into the integrated bitcoin wallet, withdraw money,
  and make payments to pieces of content. Each content has its own bitcoin
  address to which the author has the private key. When paying to a piece of
  content, the author will see they have received a payment and can withdraw or
  use it to make a payment to someone else.
- Datt heavily uses my bitcoin library,
  [fullnode](https://github.com/ryanxcharles/fullnode), for all cryptographic
  operations, including the bitcoin wallet. We also use
  [bitcore/Insight](https://github.com/bitpay/bitcore) on the backend to query
  the blockchain.

The prototype is mostly intended to be a technology demo or proof-of-concept,
and not something for end-users to use in practice. There are number of
important problems to solve before launching publically. The next milestone is
[the MVP](https://github.com/dattnetwork/datt/milestones/MVP) - that will be
the thing that is functional enough to actually be used.

The next major steps for me are to shift the emphasis slightly away from
programming and towards building a company out of this idea. Although I still
intend to spend a majority of my time programming, I will simultaneously be
pursuing other specific tasks that I dropped in my quest to finish the
prototype. This means things like, 1) Finding an engineering cofounder to help
with the enormous task of turning the prototype into a launchable product, 2)
Finding a busines operations cofounder who has more experience than I do
building and running companies, 3) Designing a minimalist product that we can
launch for the MVP, 4) Creating and executing a community plan to bootstrap the
community, 5) Raising money. I will probably post more information about these
things in the next couple of months.

There are other cool things to do next besides building the company, such as
putting on another hackathon, making announcements to our mailing list about
the status of the project, making videos of the product, or writing articles.
All of these will be coming as well.

I would like to thank all of the people who helped make this prototype
possible. These people or groups have helped make Datt happen better, faster
than it otherwise would have: Brad Kam, Chris Marie, Chris Robinson, Darren M,
Deepak Raous, Eric Martindale, George Vaccaro, go1dfish, Guillaume Dumas, Johan
Halseth, Michael Houston, Omar Mashaal, Paul Salisbury, Ramakrishnan A (Ramki),
Willy Bruns, Blockchain University, ChangeTip, IDEO Futures.

For the record, here are all the blog posts about the prototype from beginning
to end:
- [Towards a Prototype](/articles/2015-09-27-towards-a-prototype/)
- [Towards a Prototype 2](/articles/2015-10-05-towards-a-prototype-2/)
- [Towards a Prototype 3](/articles/2015-10-14-yc-and-towards-a-prototype-3/)
- [Towards a Prototype 4](/articles/2015-10-23-launch-transactions-name-next-week/)
- [Towards a Prototype 5](/articles/2015-11-01-three-months-presentations-towards-a-prototype-5/)
- [Towards a Prototype 6](/articles/2015-11-16-towards-a-prototype-6/)
- [Towards a Prototype 7](/articles/2015-11-30-towards-a-prototype-7/)
