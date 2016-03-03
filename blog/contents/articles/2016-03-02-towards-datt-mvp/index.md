---
title: "Towards an MVP"
author: ryanxcharles
date: 2016-03-02 01:00:00
template: article.jade
---
The Datt prototype has a primitive p2p protocol that is only capable of 1)
simultaneously connecting to all peers, 2) broadcasting and receiving content
from all peers. Some important ways in which it is lacking are, 1) cannot scale
beyond a few users, 2) has no ability to retrieve content that you were not
online to see, 3) has no consensus about what the content is or what order it
should be displayed in.

The bitcoin wallet feature is slightly more mature. Although it has bugs, the
wallet can actually send and receive real payments. Unfortunately, due to the
max block size issue of bitcoin, transactions have a real cost that is high
enough to prevent genuine micropayments.

The next step after the Datt prototype is the Datt MVP. The Datt MVP is
something that is actually usable to some audience. I propose that the Datt MVP
be targeted only at technical users. Datt will mostly be a backend software to
be used on more consumer-friendly front-ends. The front-end of Datt will
display the features of the Datt backend, but will not necessarily have an
interface that is easy to use by a mainstream audience. Meanwhile, Yours
([1](/articles/2016-02-26-yours/), [2](/articles/2016-02-26-making-it-yours/),
[3](/articles/2016-02-29-summary-of-hackathon/)) will be the first product
based on Datt. Yours will have its own MVP independent of Datt. Yours will have
an interface that is easy to use by a mainstream audience.

Datt should enable a "decentralized reddit" as was conceived in the original
vision. Datt itself will look a lot like a decentralized reddit with a UI
similar to Chris' mockups. On the backend, these technical issues will need to
be a part of the Datt MVP:

1) **Bitcoin micropayments** using the lightning network or something similar. It
will take some time to develop the lightning network, but it is the only known
way to have genuine p2p micropayments. The steps we will take to implement the
lightning network are, first, to develop normal bitcoin payments (done). Next,
we will develop payment channels, and then a centralized payment channel hub,
and finally a network of hubs (the lightning network).

2) **A way of arriving at consensus about content**. There does not necessarily
need to be global consensus about the content on Datt, but there should at
lease be user-level consensus. For instance, if you want to retrieve content
written by Kanye West, you should be able to retrieve Kanye West's content.
Everyone should be able to agree about what Kanye West's content is. One way to
do this is to pin a chain of Kanye West's content to the bitcoin blockchain. We
may also want to allow communities to have consensus, which requires a
consensus algorithm like proof-of-work or another one. The order of events is
to design what a content chain looks like, then allow users to pin their chain
to the bitcoin blockchain, and finally have our own Datt blockchain (perhaps
based on BigchainDB or similar) to have a record of all content.

3) **A decentralized storage system** like ipfs or web torrent. We are still at
present undecided about what storage system to use. The first step will allow
nodes simply to store all data. The Datt node will be always online and users
can reliably retrieve data from the Datt node. After this mechanism works, the
next step is to place content either on ipfs or on individual torrents for each
user. The decision for how to do this will be made later.

4) **Identity**. For now, we can simply use a master keypair to manage identity.
Unfortunately this means usernames are not globally unique.  The way to resolve
this is either by using Blockstack or a similar system.
[Blockstack](https://github.com/blockstack/blockstack) has had an enormous
amount of effort put behind it and has recently launched, so it is our first
candidate to manage identity.

I believe in creating valuable technology. The outline here for an MVP of Datt
is technically complicated, but once all the pieces are fit together, it will
enable a genuine decentralized content sharing system with integrated
micropayments. That has never existed before, and would enable the information
economy to do things that are impossible today.
