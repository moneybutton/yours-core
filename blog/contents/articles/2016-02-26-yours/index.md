---
title: "Yours"
author: ryanxcharles
date: 2016-02-26
template: article.jade
---
Yours is a product idea based on Datt. First of all, the name: "Yours" is a
normal word that everyone understands, and not based on a niche meme. If
something belongs to you, it's yours. This perfectly describes the essence of
what Datt is trying to achieve. Yours gives control of content, moderation,
hosting, and payments to the users. If it's yours, post it on Yours. Yours is
the product, but behind the scenes it is based on the Datt software and Datt
network. It is a product intended to have a mainstream audience, so it has a
mainstream name.

The product itself looks similar to the current Datt prototype. Users have a
master keypair which they use to authenticate themselves. They can post new
content that is seen by other users, and they have an integrated bitcoin wallet
that they can use to pay to a piece of content. Each piece of content has a
button to make a payment. However, the payments are not simply tips. A payer is
not simply making a voluntary payment to the author, rather they are investing
in the post, and get a portion of subsequent payments. This idea was first
introduced to me by Clemens Ley, and coincidentally Coinbase also proposed the
same idea to me a few days after Clemens.

This scheme correctly solves the incentives problem. Users are incentivized to
post qualitity content. If it's yours, post it on Yours, and you can earn
bitcoin. It also solves the incentives of the person who pays. They are not
just giving money away with no expectation of a return. They are incentivized
to upvote something early. Yes, this costs money, and they might not get that
money back. But if they upvote something early, and give it attention, it might
catch on and go viral, in which case the investor gets a huge return. The
investor gets paid too, just like the content creator. Not all investors will
get more than the put in, but many will. This financially gamifies both
creating and funding good content.

An important question is precisely what formula do we use to determine how much
each investor gets as a fraction of subsequent payments. Investors should be
incentivized to invest early, and as such they should get a higher proportion
early on. However, exactly what formula to use remains undecided. Furthermore,
it is not trivial to create a system like this in a decentralized way. There
needs to be consensus about the order of payments. That is tricky to do in a
high frequency way (but if 10 minutes is high enough resolution, the bitcoin
blockchain will work for that).

Technically, Yours can use Datt on the backend. We can create a new repo with a
new UI to satisfy the LAUNCH constraint that it must be written from scratch at
the event. Datt will simply be a dependency of the project, like a database or
API or any other dependency. Furthermore, only people physically present at
LAUNCH will work on Yours to guarantee we satisfy that constraint as well.
