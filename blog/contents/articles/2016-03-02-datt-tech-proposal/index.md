---
title: "Datt Tech Proposal"
author: ClemensLey
date: 2016-03-02
template: article.jade
---

*I think we should consider splitting the project into two parts (similar to the Datt-Yours split). We could use our core technology to build a "framework for building decentralized web apps with micropayment integration". On top of that we and others could build apps like [Yours](http://yours.press/).*

The advantage of the split would be that the base layer would be of interest to a much larger audience (people who want to build apps on top of it). These would be more likely to contribute to the open source project. We’d also be de-risking the company because launching a consumer product is a bit of a gamble. If there are several applications we’d only need one of them to work (not necessarily the one built by us).

There are two main technical hurdles that need to be overcome in order to build datt: adding persistence and scalability to the current prototype (called the base layer below) and building a payment layer (basically the lightning network). I think we should focus the payment layer first bc the current datt implementation might work quite well while the project is small. In case we hit scale fast we might want to build a persistence layer with a limited feature set on top of IPFS before we start working on the one sketched in the Base Layer section below.

## Payment Layer

*I think we are going to need something very similar to the lightning network. The lighting network fulfils the promise of Bitcoin: instant microtransaction at almost no cost. Amazing applications will be possible for the first time when we have the lightning network and we should be the first team to build one.*

Here is the problem with bitcoin today: The standard transaction fee is 0.0001BTC = $0.04 and rising fast. Thus realistically the smallest payment that makes sense is around 10x that amount. This is too high for the applications we have in mind. In addition Bitcoin is slow. On average, a transaction is confirmed after 10 minutes, in practise it’s more like 5 to 50 minutes. 

There are three main problems with implementing the lightning network today:

The first is that an implementation requires a fix to transaction malleability. We can either hope that this will be fixed through seg wit before we are done implementing. Or we can use the new CLTV opcode (BIP 65) rather than so-called Spillman-style payment channels like the implementation of the 21-computer company.
[https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki)

The second problem is that the lightning network as proposed by Joseph Poon and Thaddeus Dryja requires new sighash modes in order to make hash timelock contracts work. A solution to this problem has been suggested by Rusty Russell.
[https://github.com/ElementsProject/lightning/blob/master/doc/deployable-lightning.pdf](https://github.com/ElementsProject/lightning/blob/master/doc/deployable-lightning.pdf)

The third problems is that the routing part of the lightning network has not been specified in complete detail. However, routing has been studied to death over the past 30 years, and I’m sure a simple routing protocol will be sufficient for the start. Routing via distributed hash tables will certainly work, but there are likely better solutions.

### Existing Tech

There is no implementation of the lightning network in javascript, we will have to build one ourself. There is a partial C implementation and an full implementation in python.
[https://github.com/ElementsProject/lightning](https://github.com/ElementsProject/lightning)
[https://medium.com/@21/true-micropayments-with-bitcoin-e64fec23ffd8](https://medium.com/@21/true-micropayments-with-bitcoin-e64fec23ffd8)

There is one javascript implementation of payment channels as part of the bitcore project and one in Coffeescript (compiles to JS). We might be able to use these as a part of a full lightning network implementation.
[https://bitcore.io/api/channel/](https://bitcore.io/api/channel/)
[https://github.com/jesstelford/payment-channels](https://github.com/jesstelford/payment-channels)

## Base layer

*Decentralization offers a better way of building web apps than the https based model we use today. From a technical perspective the advantages of a decentralized system are*

* *auto scalability: every user joining the network brings her own computational power, so more power is added as more people use the service*

* *auto load balancing: a popular website has more power than a niche one, so power is directed where it is needed*

* *ease of building real time services: side product of using BitTorrent*

* *speed: at least in some use cases*

*In addition there are political (censorship resistance) and economic advantages (lower server costs). It is clear that this model will not be superior in all use cases, but certainly in some.*

To build a framework for decentralized web application we will treat the data needed to render a website like a file in a BitTorrent network. Let me give you a quick reminder of the basic working of BitTorrent. Say Alice wants to download a file from a BitTorrent network. Recall that the BitTorrent protocol splits a large file into many small parts. Julie’s computer joins a group of computers that have parts of the desired file (this group is called a swarm in BitTorrent speak). As soon as Alice joins the swarm, other nodes in the swarm start sending her parts of the file. *Now here is the trick:* as soon as some parts of the file arrived at Alice’s computer, it turns into a server. It starts sending the parts it has to other computers in the swarm that need them. This protocol is known to work well in practise and is extremely scalable (millions of computers). 

So how can we use this protocol to build decentralized web apps? We are going to have one swarm responsible for serving each website of the application. When a client, say Bob’s computer, what’s to render a website, it joins the swarm for that website. The standard BitTorrent protocol will start sending parts of the data needed for that website. At the same time Bob’s computer will serve data to other users on that website, adding computational power to the respective swarm.

This architecture will allow the application to scale automatically. As more users use the app, they bring additional storage and bandwidth to the network. This power will be directed precisely at the websites that are in need of additional power. 

But how do we build realtime apps? Again, *we get this capability for free by using the BitTorrent protocol*. Say that Carlos adds a comment to a website. To publish his comment, Carlos signs his comment and sends it to the swarm serving the website as a new piece. Other computers will forward it to their peers until everybody has Carlos’s comment.  

I’ve glossed over a lot of details in the description above. But I think that an architecture close to the one sketched could work for applications we want to build. The ideas used are similar to ones used in IPFS and other decentralized protocols.

BitTorrent has been build for distributing large files. I am not sure how well it can be made work for smaller files. That’s why I am advocating for abstracting out this base layer and not commit to a final consumer product at this point. This system is certainly different from the centralized model the internet uses today. I am sure that we will be able to find applications where this difference will give us an unfair advantage. 

### Existing Tech

The big question is whether to use IPFS or WebTorrent. Both projects are build by very smart people (Juan Benet and Feross Aboukhadijeh) and we should reach out to both to explore collaborations. 

IPFS is a bigger project than WebTorrent. It is not only a DHT-based BitTorrent system but also contains a naming system, merkle-based data format, and a network layer used for establishing connections between peers. The whole system seems to be very configurable where layers (the DHT for example) can be swapped for different implementations. The big disadvantage of IPFS is that it’s javascript implementation seems limited at this point.
[https://github.com/ipfs/js-ipfs](https://github.com/ipfs/js-ipfs)

WebTorrent however is implemented in JavaScript. It’s a modern DHT-based BitTorrent implementation that works both in node and in the browser. It is also nicely modularized, so that we can pick and choose which components to use.
[https://github.com/feross/webtorrent](https://github.com/feross/webtorrent)
[https://github.com/feross/bittorrent-dht](https://github.com/feross/bittorrent-dht)
[https://github.com/feross/bittorrent-swarm](https://github.com/feross/bittorrent-swarm)

## Application Layer

*Having said that we should not commit to a consumer product quite yet, I still think that building a decentralized Reddit with micropayment integration is an awesome idea. The product could be close to Yours, the app that Ryan, Steven, and Anupam have built at the Launch Hackathon. Yours is similar to Reddit but users can invest in posts by sendind micropayments to one another.* 

In a product similar to Yours the real time capability could really add something valuable to the experience. Immagine how much more fun Reddit would be if you’d get a real time notification whenever someone comments to one of your posts or comments, upvotes your content, or interacts with you in some other way. Each of these actions make the user feel a little happy (well, in most cases hopefully). If you add the joy of getting a small amount of money at the same time (even a symbolic one), it could be a very engaging app.

I think building one app is not a very good way of learning how to build consumer facing products. In fact I think it is the second worst way to do that (the worst would be to build no product at all). The best way to learn is to build many small products imo.
 
Ryan and the team at Launch have shown that it is possible to implement a bare bone version of an app in a very short amount of time (48h) with a very small team (4). If we have a framework that makes it easy to build decentralized apps with micropayment integration, we could try a different experiments and see what sticks. 

## Roadmap

**Step 1.** Build a MVP without persistence or scalability and based on bitcoin transactions instead of the lightning network (done, it’s called Yours).

**Step 2.** Build the lightning network and add it to the current prototype. If we manage to build the lightning network we will get a huge amount of respect from the hacker community. At this point we can already build some pretty amazing apps that were never before possible.

**Step 3.** After step 2, reconsider the state of the IPFS javascript implementation. If it is more mature, we might want to use it. If not, we’ll build on top of web torrent.
