---
title: "Countdown to Launch"
author: ryanxcharles
date: 2016-04-04
template: article.jade
---

Clemens Ley, Steven McKie and I got together yesterday and discussed what
properties of Datt are necessary for MVP and came up with a timeline for
launch. Assuming our time estimates are correct, we believe we can launch a
mainnet MVP by May 15, less than a month and a half from now. The properties of
MVP are similar to what I sketched out in [this
article](/articles/2016-03-02-towards-datt-mvp/) and [this
article](http://blog.datt.co/articles/2016-03-03-what-yours-needs-from-datt/),
but with some important differences. The most important of those properties
are:

- **We will be rebranding from Datt to Yours**. After discussing naming with
  many people, it is clear that "Datt" is a good name for technical people and
  bitcoin people, but it is not a good name for a mainstream audience, since
  most people don't get the joke. Fortunately, we have found a name good for
  all audiences - [Yours](http://yours.press). We will come up with a plan for
  the rebrand and execute the plan before launch. After the rebrand, Datt, the
  software, will still be called Datt, but the public facing name we will use
  will be Yours.  Datt will be like the name of an engine in a car. Unless you
  are technically savvy, you probably have no idea the name of your engine is,
  but you do know the name of the company that made your car. Datt is the name
  of the engine and Yours is the compay. Part of that plan will probably
  include moving the blog and software from Datt-branded pages to Yours-branded
  pages. The Datt Blog will probably become the Yours Engineering Blog.
- **We will finish our implementation of a [trustless payment channel hub based
  on hash time lock contracts](https://github.com/dattnetwork/fullnode-pc)**
  and integrate that into the bitcoin wallet before launch, so that genuine p2p
  micropayments are possible. The "tipping" cost will go from about $1 to about
  $0.05. We believe this innovation is necessary to create the mainstream
  appeal we are looking for, and on-chain transactions don't fit the bill
  because the transaction fees are too high. Ultimately, we want to implement
  the lightning network, but the lightning network will take too much time to
  build. We can move from a trustless hub to the lightning network when the
  time is right.
- **We will not be integrating decentralized storage before launch**, but we
  will be forwards-compatible with implementing decentralized storage later.
  Since we have limited engineering resources, we believe our focus should be
  on decentralized micropayments, and not storage, since micropayments make a
  significant difference in the product, and storage doesn't. Content on
  Datt/Yours is already signed, hashed and authenticated client-side, so moving
  to a decentralized storage system where content is addressed by hash is
  something we can iterate to over time. We would rather launch sooner to get
  critical feedback on the product than wait for decentralized storage.
- **We will integrate Steven and Darren's UI work and add a leaderboard.** We
  believe the leaderboard will be an important psychological tool to inform
  potential users at a glance that Yours enables people to earn money, which
  makes it different than any other mainstrea social media app.
- **Have a brief testnet launch before the mainnet launch** to identify any
  money-losing bugs that escaped our tests during development.
- **Have and execute a community/growth/launch plan.** We will write down an
  execute a community plan to build the initial user base. This will involve a
  limited beta preview to a select audience, emailing the mailing list,
  notifying Slack members, etc. We will have a weekly growth target (say, 10%,
  although the number is undecided at present), to make sure we are on the path
  to our long-term goals. We will also do some "coffee shop tests" where we ask
  random people at coffee shops to make sure that our product appeals to a
  mainstream audience.

