---
title: "Status of the Datt Technology"
author: ryanxcharles
date: 2016-02-22 02:00:00
template: article.jade
---
Since [The Genesis
Article](https://ryanxcharlestimes.com/fix-reddit-with-bitcoin-7da3f85fb9ba)
and the hackathon that kickstarted Datt
([1](http://www.meetup.com/blockchainU/events/224266192/),
[2](http://blog.datt.co/articles/2015-07-31-hackathon-day-one/),
[3](http://blog.datt.co/articles/2015-08-02-hackathon-day-three/)), the
technology has substantially matured from zero to a [working
prototype](http://blog.datt.co/articles/2015-12-11-prototype/). However, there
is a good deal of effort left to evolve the prototype (which is good for demos,
but not ready to use) into the MVP (which can actually be used by people).

### How Datt Works Today

The Datt prototype is written in "isomorphic" javascript, which means that
almost everything that works in node.js also works in a web browser. I say
"almost everything" because, right now, the network code only works in a web
browser. That is because the node.js network code is unfinished, and it was
more important to finish the browser network code first so that the project
could be demoed.

Right now it is possible to use Datt to do the following things: 1) Create a
new identity consisting of a master BIP39 mnemonic, which occurs when you use
the app for the first time, 2) Post new content which is broadcast and can be
seen by all peers who are currently online, 3) Deposit (testnet) bitcoin into
the built-in bitcoin wallet, and click a button to "tip" any content from
another person. Thus, the Datt prototype achieves the basic goal we set out to
achieve; a decentralized social media app with integrated bitcoin payments. It
is not very usable yet, but most of the fundamental technology is now in place
and can be iterated to the MVP.

The Datt application is broken up into two core pieces: dattcore, available in
the core/ directory, which is the logic of the Datt p2p protocol and bitcoin
wallet, and dattreact, available in the react/ directory, which is the React
frontend for Datt. dattcore works both in node.js and a web browser. In a
browser, dattcore compiles to a file called datt-core.js. This file is used by
dattreact. None of the "datt" logic is contained inside dattreact. dattreact
only contains the logic of the UI, not the p2p protocol or bitcoin wallet.
dattreact only works in a web browser at present, but it is ideal to make the
UI work in node as well so that the UI can be rendered before sending it to the
client (although, of couse, the UI could never be 'viewed' in node.js, which
does not have a viewport like a browser).

To understand dattcore, start by viewing core/index.js (the entrypoint for
dattcore). Notice how index.js contains the API used by dattreact. All
functionality of dattcore used by dattreact is accessed through index.js. To
understand dattreact, view react/index.js (the entrypoint for dattreact).
index.js uses layout.js, and then most of the UI components are broken up into
their own files. Notice how dattreact only accesses dattcore through the main
interface visible in core/index.js.

Datt is heavily dependent on
[fullnode](https://github.com/ryanxcharles/fullnode), the javascript bitcoin
library by Ryan X. Charles. fullnode is used for several things: 1) To provide
inheritence of the basic objects, particularly Struct, so that objects have a
common set of features such as converting them to/from buffers (a.k.a.,
serializing/deserializing them), 2) To provide all (or almost all) of the
bitcoin functionality necessary to send and receive bitcoin, 3) To provide the
basic cryptography for non-bitcoin things like signing and verifying data.
Soon, fullnode will also be used to provide the worker interface for Datt, so
that the workers code is not duplicated between Datt and fullnode.

### How Datt Will Work Tomorrow

There are many ways in which the Datt prototype is not ready to launch to a
general audience. The most significant is that the p2p protocol is extremely
immature. Datt has a custom p2p protocol which can distribute content to all
peers. It does not have the ability to retrieve old content, and has an
extremely inefficient architecture of connecting to every available peer. The
most significant change to Datt that needs to occur before launch is that our
p2p protocol either needs to be fleshed out in great detail, or it needs to be
replaced with either a custom blockchain, and/or ipfs, web torrent, or some
other p2p protocol that is more complete than ours. It is undecided what p2p
protocol to use, but it is almost certainly the case that we will use ipfs or
web torrent to store data and not invent our own distributed data storage
system (if we use a blockchain, the blockchain would not store the data itself,
but hashes of the data).

The actual product, or end-user experience, will also probably change before
launch. Although everyone recognizes the value of a "decentralized reddit", it
is very important to get the incentives right. That is, the people posting the
content need to be financially incentivized to do so, and the people paying for
content need to be financially incentivized to do so. This will not necessarily
take the form of voluntary tipping. It may be that users "buy" content to place
it on their own page, or perhaps they "invest" in content and get a portion of
subsequent payments. Since the product is still undecided, dattcore needs to be
compatible with the notion of paying for content in any way we might later
choose, so for now the code should be general and simply follow the notion of
"users exchanging bitcoin and content on a p2p network".

Whenever the details are decided, the TODO items will appear on our [issues
page](https://github.com/dattnetwork/datt/issues).

### Summary
The datt prototype is written in isomorphic javascript. The backend, dattcore,
is heavily dependent on fullnode. The frontend, dattreact, leverages React. The
most significant problem with the backend at present is that the p2p protocol
is immature and needs to be replaced with something better. ipfs and web
torrent need to be researched in the context of Datt, and a decision made about
what p2p protocol to use. It is possible to use a blockchain (either a custom
blockchain, the bitcoin blockchain, or both) to have a censorship-resistant
history of content, but the content itself will need to be stored either on
ipfs or on one or more torrents. Furthermore, since the product is still
undecided, the backend and frontend need to be flexible enough to cover the
possible different products we may create.
