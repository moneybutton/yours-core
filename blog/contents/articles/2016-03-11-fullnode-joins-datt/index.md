---
title: "fullnode+Datt"
author: ryanxcharles
date: 2016-03-11
template: article.jade
---

fullnode is a javascript bitcoin library I created in the summer of 2014, and
which provides most of the bitcoin functionality of Datt. If you read the
commit history, you'll see it was originally called "privsec", because it was
going to be a bitcoin wallet focused on privacy and security. It was not going
to be a full implementation of bitcoin - just a wallet. I was an engineer at
BitPay working on [bitcore](https://github.com/bitpay/bitcore) at the time, and
I realized that I didn't like the interface to bitcore and would rather
reimplement things with a better interface for my wallet. In short order I
realized the real solution was simply to rewrite bitcore with a better
interface, and thus privsec became bitcore2. Not long after that, I left BitPay
to join reddit. But in my spare time in between, I forked bitcore2 to a new
project called "fullnode" with the vision of turning fullnode into a bitcoin
full node. fullnode then temporarily became the [reddit implementation of
bitcoin](https://github.com/reddit/fullnode). Meanwhile, the engineers at
BitPay pulled in bitcore2 and fullnode into a new version of bitcore, which was
later named bitcore 1.0. To this day, fullnode and what is now
[bitcore-lib](https://github.com/bitpay/bitcore-lib) share hundreds of the same
commits and a similar architecture because they are largely the same code.

I've kept fullnode as a separate project rather than merging with bitcore or
another project because it is valuable to be able to shape the project
according to my needs. Right now the only project using fullnode in practice is
Datt, which is heavily dependent on fullnode. I think the right way to think
about fullnode is "Datt's bitcoin library", and as such, as of today, I have
moved the fullnode repo from my GitHub page to the [Datt GitHub
page](https://github.com/dattnetwork/fullnode). We can now consider fullnode to
be The Official Bitcoin Library of Datt.

fullnode has a lot of bitcoin functionality, but not all. I never finished the
actual "full node" part of fullnode. fullnode cannot download the blockchain or
serve an API for it. It can, however, perform all of the basic cryptography of
bitcoin, and has a notion of most major bitcoin data structures, and most
importantly can build and sign bitcoin transactions.

The future of fullnode will be shaped by the needs of Datt. It will be
important to finish the blockchain part of fullnode so that it can serve as the
blockchain API for Datt. Additionally, we will need to support segregated
witness and the lightning network in order to enable genuine bitcoin
micropayments in Datt. [The GitHub issues page lists all near-term problems to
be solved in fullnode](https://github.com/dattnetwork/fullnode/issues). As time
allows, I will create issues for segregated witness and the lightning network
and sketch out a path for how we can implement those protocols in fullnode.

