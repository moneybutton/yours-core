---
title: Thoughts on DHTs for Datt
author: ryanxcharles
date: 2015-08-26
template: article.jade
---
A DHT is a way to store key value pairs across a distributed network of
computers. If we used a DHT to store data for Datt, we would hash the content,
and the key is the hash, and the value is the content. We already intend to
store content this way whether we use a DHT or not, so a DHT is a very
appropriate data storage system, for us, that gives us an automatically
distributed data store.

The only issue with DHTs is that they are complex, and I haven't found an
implementation that solves our problem without introducing new problems. The
most suitable implementation for us is ipfs. That project was specifically
designed to allow permanent storage. Datt content could be built on top of ipfs
in two different ways:

1) The content is stored on ipfs.

2) The app itself runs on ipfs.

The first is the most interesting and useful. The only problem is that while
their server-side application written in Go is fairly mature, their
browser-side code is not. Juan told me their browser-side implementation will
be ready in two months (as of last week). That is not early enough for a
prototype. If we didn't do anything browser-side, we could require that you run
a "full node" to have "trustless" operation of Datt, but that changes the
nature of what we're doing pretty significantly just to use their data store.

Furthermore, I'm not aware of any major production applications using ipfs. It
would be risky for Datt to build on a "beta" version of software that is
critical for our infrastructure. I think we are better off not using ipfs for
the present time, then revisiting whether we should use it once they finish
their browser-side implementation in October. We will know a lot more about our
own application at that time and will be in a good position to know whether
it's appropriate.

There are other DHTs we could use, such as Kademlia, suggested by Willy.
However, Kademlia is designed for temporary storage of data, not permanent
storage. The data expires after a certain time period. It doesn't seem that
Kademlia was designed to solve our problem, but rather the problem of keeping
track of what peers are accessble on a network in a decentralized way. That
would be useful to us, but doesn't solve the problem of data storage.

A DHT is probably the right way to store data for Datt over the long-term, but
in the near-term I'm worried it would delay getting to a prototype or MVP, and
it's not actually strictly necessary for our application. It is also possible
to "add" a DHT later if the nodes themselves host the content. We can simply
add support for a DHT later, where the content is stored and retrieved from the
DHT. It doesn't need to be a critical piece of infrastructure for us. However,
if after the prototype we decide our p2p protocol is not good enough, we could
rewrite our infrastructure around a DHT like ipfs, or something else similar.
We could also design our own, but it's unlikely we would do a better job of
that than the other projects that have put huge amounts of time into DHTs
already.
