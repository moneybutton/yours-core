---
title: "How Yours Will Use the Lightning Network"
author: ryanxcharles
date: 2016-04-17
template: article.jade
---
[Yours](https://www.yours.network/) is a marketplace for content where
transactions are for very small amounts of money, approximately one cent. The
concept of very small payments, or micropayments, has been the subject of
science fiction since the 1990s. For technical and economic reasons, no product
has been able to lower transaction fees enough to make micropayments viable,
until now. New technology based on bitcoin, the Lightning Network, makes
micropayments viable. Yours will be the first mainstream consumer product to
leverage the Lightning Network to monetize that which was previously
unmonetizable: small pieces of content.

In order to understand the Lightning Network, one must first have a basic
understanding of bitcoin. Bitcoin is a peer-to-peer financial system where it
is possible to hold and transmit value (bitcoin) with no trusted third party,
like digital cash. A user can send bitcoin to another user by signing and
broadcasting a transaction. The broadcasted transaction is noticed by other
bitcoin users (miners) who run proof-of-work calculations and assemble recent
transactions into a block. There is one global chain of blocks, the blockchain,
which is equivalent to the history of all transactions, or the global ledger of
the everyone’s balance of bitcoin. In order to incentivize miners to perform
the proof-of-work calculations, each transaction has a fee. The fee rate is
determined by a market, and thus changes continuously.

Although bitcoin transaction fees are small, they are not zero. A payment of
one cent with bitcoin would incur a fee of five cents — too high to be
economically viable. Fortunately, it is possible to reduce fees by many orders
of magnitude with smart contracts. Smart contracts are conceptually related to
legal contracts, except they are enforced by cryptography rather than
governments. With an elaborate network of smart contracts, users can transmit
value to each other without broadcasting transactions to the blockchain. The
blockchain is only used when a user violates a smart contract, in which case
the transactions settle on the blockchain, incurring a fee. So long as most
users obey the contracts most of the time, settlement transactions will be few.
If one thousand smart transactions occur for every broken contract, then the
fees are one thousand times lower than normal, or thousandths of a cent, making
micropayments economically viable.

There are legal questions over the smart contracts used in the Lightning
Network. If a user executes a smart contract on their computer, should they be
regulated as a money transmitter like Western Union? This is analogous to
asking whether an airplane that flies over a highway should obey the speed
limit. To anyone that understands what an airplane is and for what purpose it
is used, the thought that a highway speed limit should apply is absurd.
However, what is a joke to the engineer who builds the airplane is not a joke
to the prosecutor who wants to enforce the speed limit. What is needed is
clarity over the mechanics and intent of the Lightning Network so that anybody
can judge for themselves whether traditional finance regulation applies.

The most important concept to understand first is that the Lightning Network is
software running on computers. When we discuss the “payments” that occurs
between users, there are no dollars being stored or transmitted. What is
actually happening when one user, Alice, pays another user, Bob, is that Alice
runs an algorithm on her computer that takes data from her computer and data
from Bob’s computer and produces more data that is communicated to Bob’s
computer and other computers. Alice’s “private key” is not literally a key in
her desk drawer, her “signature” is not literally ink on a piece of paper, and
her “transaction” does not involve shaking hands. While these things are
analogous to their real-world counterparts, they are not equivalent. Even Alice
and Bob are usually not human. Everything that occurs in the Lightning Network
is software running on computers.

The Lightning Network is based on the concept of payment channels. When Alice
wants to make a payment to Bob, she signs a transaction to Bob. In order to
keep transaction fees low, neither Alice nor Bob broadcasts the transaction
right away. When Alice wants to send more money to Bob, she sends him a new
transaction with more money that updates and replaces the old transaction.
Alice may send thousands of transactions to Bob in this manner. Only once they
desire to settle do they broadcast the transaction to the blockchain, incurring
a fee. Fees are much lower with payment channels than with normal bitcoin
transactions, but they have a problem: it only works when Alice wants to pay
Bob. When Alice wants to pay another user, Carol, Alice must create a new
payment channel with Carol. Creating a payment channel involves broadcasting a
transaction to the blockchain before making any payments, and another
transaction to settle after all payments are made. So each payment channel
requires two fees, one at the beginning and one at the end. If Alice is only
ever going to pay Carol once, she doesn’t save any fees. If Alice pays many
people only once, she actually pays more fees with payment channels than with
normal bitcoin transactions.

It is possible to reduce fees when Alice pays Carol if Bob acts as a trustless
counterparty. Alice does not have a payment channel to Carol, but Alice does
have a payment channel to Bob, and Bob has a payment channel to Carol. If Alice
pays Bob and Bob pays Carol, effectively Alice has paid Carol. However, Bob may
not be trustworthy and may take the money from Alice without sending any money
to Carol. So Alice uses a smart contract: Alice sends a transaction to Bob that
Bob can only spend if he proves he sent the same amount of money to Carol. Bob
is a trustless counterparty — he may or may not be nefarious, but it doesn’t
matter, because Alice and Carol do not have to trust him in order to route a
payment through him. His open payment channels are just used to minimize
transaction fees.

The Lightning Network is a network of payment channels. When Alice wants to pay
Carol, or Dave, or Susan, she finds the shortest route and makes a payment
through the route using smart contracts. If Alice cannot find any route to pay
Dave, Alice opens up a channel directly to Dave. Although this channel incurs a
transaction fee, it is worth the fee if Dave is connected directly or
indirectly to many other people, so that any time Alice wants to pay any of
them, she does not have to pay a fee.

Yours aims to enable amateur content creators to start earning money for their
essays, music, videos or other works of art. Because each transaction is small,
Yours uses the Lightning Network to keep transaction fees low so that creators
get to keep most of their earnings. Our users are just people paying each other
bitcoin for content — they are not money transmitters like Western Union. They
are able to do this by leveraging advanced technology that has only recently
been invented, not by driving 600 mph on the highway. Yours will be launching
an early preview in May, 2016. [Sign up for the mailing
list](https://www.yours.network/) of you would like to be invited.

---------------------

This article, based on [Clemens' introduction to the Lightning
Network](https://github.com/yoursnetwork/fullnode-pc/blob/9f34c546e4e44001517b5c7e87f71566484b6249/docs/gentle-lightning.md),
is intended to explain the legal context of the Lightning Network as it applies
to Yours for a non-technical audience. It is only a first-pass and will be
refined over time.
