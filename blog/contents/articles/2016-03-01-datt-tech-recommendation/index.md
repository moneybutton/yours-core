---
title: "Datt Tech Recommendation"
author: clemensley
date: 2016-03-01
template: article.jade
---

*I think we should consider splitting the project into two parts (similar to the
Datt-Yours split). A base layer could be a framework for building
decentralized, real time, social applications with micropayment integration. On
top of that we and others could build apps like Yours.*

The advantage would be that the base layer would be of interest to a much
larger group of people (people who want to build apps). These would turn be
more likely to contribute to the open source project. We’d also be de-risking
the company bc launching a consumer product is a bit of a gamble. If there are
several applications we’d only need one of them to work (not even necessarily
the one built by us).

There are two main technical hurdles that need to be overcome in order to build
datt: adding persistence and scalability to the current prototype (called the
base layer below) and building a payment layer (basically the lightning
network). *I think we should focus the payment layer first* bc the current datt
implementation will work quite well while the project is small. Once we are
done with that we can add persistence and scalability to the existing
prototype.

Base Layer
----------

*Decentralization offers a better way of building web apps than the https based
model we use today. From a technical perspective the advantages of this model
are auto-scalability (every user brings their own computational power),
auto-load-balancing (a popular subreddit has more power than a niche one), ease
of building real time services (side product of using BitTorrent), and speed
(at least in some use cases). In addition there are political (censorship) and
economic advantages (lower server costs).*

The idea is to have the data that is needed to render a website be treated like
a file in a BitTorrent network. Updates to the website (like comments and
posts) can be made by distributing new pieces into the respective BitTorrent
swarm. 

If a user opens a website of an application, the users node performs a lookup
find(website-id, my-node-id) in a DHT to find contact information for nodes in
the swarm that “servers” the website. The DHT contains key-value pairs of the
form &lt;website-id, list-of-nodes-serving-website&gt;. Once the list of nodes is
found, my-node-id is added to the list indicating that the users node is not
part of the swarm. Upon leaving the website the id is removed from the list.
list-of-nodes-serving-website should be bounded length and one must think about
a suitable eviction policy

Once contact information to the swarm has been obtained, the users node joins
the swarm for that website. The standard BitTorrent algorithm will push the
data for the website to the user. If the user adds content to a website (for
example a comment, post, or vote) he publishes a new piece into the swarm. That
piece is pushed through the network to all other users that are on that website
atm. That’s the real time functionality. Content can be cryptographically
signed to assure auth.

Every node (both light and full) has a database that stores key-value pairs.
The data store is write only, so a key-value pair would never be deleted. Each
key-value pair is a piece in the BitTorrent swarm, so adding and distributing
pairs can be done easily using existing BitTorrent functionality. Once a light
node leaves a swarm it locally deletes all content, full nodes can decide to
keep pairs from multiple swarms.

The key value pairs are used to model a Merkle graph that stores the website
content. Versioning like in Git can be used to make edits (eg of comments)
possible.

Existing Tech
-------------

The big question is whether to use IPFS or WebTorrent. Both projects are build
by very smart people (Juan Benet and Feross Aboukhadijeh) and we should reach
out to both to explore collaborations. 

IPFS is a bigger project than WebTorrent. It is not only a DHT-based BitTorrent
system but also contains a naming system, merkle-based data format, and a
network layer used for establishing connections between peers. The whole system
seems to be very configurable where layers (the DHT for example) can be swapped
for different implementations. The big disadvantage of IPFS is that it’s
javascript implementation seems very limited at this point.

* https://github.com/ipfs/js-ipfs

The huge advantage of WebTorrent is that it is implemented in JavaScript. It
seems like a mature enough projects to be used in a production environment.
It’s a modern DHT-based BitTorrent implementation that that works both in node
and the browser. It is also nicely modularized, so that we can pick and choose
which components to use.

* https://github.com/feross/webtorrent
* https://github.com/feross/bittorrent-dht
* https://github.com/feross/bittorrent-swarm

Payment Layer
-------------

*I think we are going to need something very similar to the lightning network.
The standard fee today is 0.0001BTC = $0.04 and rising. Thus realistically the
smallest payment that makes sense if around 10x that amount which is too high
for the applications we have in mind.*

There are three problems with implementing the lightning network today:

The first is that an implementation of the lightning network requires a fix to
transaction malleability. We can either hope that this will be fixed through
seg wit before we are done implementing, or we can use the new CLTV opcode (BIP
65) rather than so-called Spillman-style payment channels like the
implementation of the 21-computer guys.

* https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki

The second problem is that the lightning network as proposed by Joseph Poon and
Thaddeus Dryja requires some new sighash modes in order to make hash time
locked contracts work. A solution to this problem has been suggested by Rusty
Russell.

* https://github.com/ElementsProject/lightning/blob/master/doc/deployable-lightning.pdf

The third problems is that the routing part of the lightning network has not
been specified in complete detail. However, routing has been studied to death
over the past 30 years, and I’m sure a simple routing protocol will be
sufficient for the start. DHTs will certainly work, but there are likely better
solutions.

Existing Technology
-------------------

There is no implementation of the lightning network in javascript, we will have
to build it ourself. There is a partial C implementation and an full
implementation in python
* https://github.com/ElementsProject/lightning
* https://medium.com/@21/true-micropayments-with-bitcoin-e64fec23ffd8

There is one javascript implementation of payment channels as part of the
bitcore project and one in Coffeescript (compiles to JS). We might be able to
use these as a part of a full lightning network implementation.

* https://bitcore.io/api/channel/
* https://github.com/jesstelford/payment-channels

Application Layer
-----------------

Here is how a decentralized Reddit could work: When a node creates a new
subreddit, it’s id is added to the DHT to make the subreddit discoverable by
other nodes. The base layer provides all the needed functionality to serve data
for websites, and for adding content to the subreddit. 

Elements like comments and posts can have associated addresses (like the ones
of previous investors). We could use the payment layers to send bitcoins
between users.

How To Get There
----------------

* Step 1. Build a MVP without persistence or scalability and based on bitcoin
transactions instead (done, it’s called Yours)

* Step 2. Build the lightning network. Add this to the current prototype. If we
manage to build the lightning network we will get a huge amount of respect from
the hacker community. At this point we can already build some pretty amazing
apps that were never possible before.

* Step 3. After step 2, reconsider the state of the IPFS javascript
implementation. If it is more mature, we might want to use it. If not, we’ll
build on top of web torrent.
