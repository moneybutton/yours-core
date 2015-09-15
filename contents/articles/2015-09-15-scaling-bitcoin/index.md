---
title: Scaling Bitcoin
author: ryanxcharles
date: 2015-09-15
template: article.jade
---

I had the pleasure of attending the [Scaling Bitcoin Workshop in Montreal from
Sep. 11 - 13](https://scalingbitcoin.org/montreal2015/). This is one of the
best bitcoin conferences I've been at due to the density of intelligent
conversation. However, I don't think it will change much about scaling bitcoin.
Instead, I hope the outcome will be that there will be more friendliness and
less trolling in the bitcoin community, now that more people have met each
other in person.

I'm fairly confident the overpowering economic interests of the actors in the
bitcoin community will determine what happens, which is that the max block size
will increase, and payment networks networks like the lightning network or
alternatives like sidechains will also be developed, but slower, and only after
a max block size increase has happened. The basic reason for this is simple:
Almost everyone wants more transactions, but lightning and sidechains are much
harder to develop and a long way from production, and not to mention that they
don't solve the same problem (they are not as secure or trustless as bitcoin).
It is easier, safer, and more useful to increase the max block size.

I could write a lot about the max block size, since it has been an issue the
entire time I've been involved in bitcoin (since early 2011). However, I don't
think a long argument would have much of an effect. The short version is that
I'm in favor of increasing the max block size, or removing it altogether,
because being able to fit more transactions in a block is better for almost
everyone, including myself. It is not a matter of figuring out whether to
increase the max block size, but how.

For Datt, larger blocks are better because it means we can simply use bitcoin
and delay developing a payment network, so we can spend our precious developer
resources on more fundamental elements of Datt itself, rather than building
bitcoin infrastructure. However, I don't actually know how long it will take to
increase the max block size sufficiently. If an increase in the max block size
is delayed for a year, transaction fees might be high enough that Datt is not
viable unless we implement a payment network. Since no one has actually
finished a payment network on bitcoin, we would probably want to leverage the
half-finished implementations that already exist as a reference point for
writing our own from scratch, which would take a significant amount of time and
effort. This would almost certainly delay the launch of Datt, unless we could
somehow find enough developer resources to develop Datt and the payment network
in parallel, which I think is unlikely.

* [See my summary from co-leading the "Hosting & Infrastructure" roundtable at Scaling Bitcoin](https://gist.github.com/ryanxcharles/b5011eedf96601c7007b)
* [See my post on the bitcoin-development mailing list about what block size would be necessary for bitcoin to be a global settlement network](http://lists.linuxfoundation.org/pipermail/bitcoin-dev/2015-May/008190.html)
