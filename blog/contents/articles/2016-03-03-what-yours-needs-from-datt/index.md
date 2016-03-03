---
title: "What Yours Needs From Datt"
author: ryanxcharles
date: 2016-03-03
template: article.jade
---
Yours is a product based on Datt we developed at the LAUNCH Hackathon last
weekend ([1](/articles/2016-02-26-yours/),
[2](/articles/2016-02-26-making-it-yours/),
[3](/articles/2016-02-29-summary-of-hackathon/), [4](http://yours.press)).
Yours needs some but not all the features of Datt to reach MVP. In order to
reach MVP of Yours sooner rather than later, I suggest it needs the following
properties of Datt:
- Yours does not need genuine micropayments. It is worth experimenting with
  moderately large payments such as at least $0.25 or perhaps $1.00. The
  current Datt wallet is almost good enough for Yours. We just need to make
  sure it doesn't lose money and has an easy way to backup and restore.
- Yours needs consensus about what content and payments were created and when,
  but this consensus does not need to be decentralized for MVP. However, it
  should be forwards compatible with a decentralized solution, i.e. can be
  converted to a decentralized solution once that software is ready. The way to
  do this is basically to design a centralized blockchain that is hosted on
  Yours servers. There will need to be a plan on how to migrate it to something
  decentralized later, but this does not have to be decentralized for the MVP.
- Yours does not need decentralized content storage, because it is more
  valuable to get the MVP out sooner so that we can learn what people actually
  want than waiting for decentralized storage. However, as with consensus about
  content, it is desirable to have a path forward. For this we need to make
  sure content and actions are addressed by hash, as they already are, and as
  such can be stored and retrieved on ipfs or something similar at a later
  date.
- Yours does not need a full identity solution for MVP, but needs at least some
  features to prevent spam accounts. An easy to way to do this is to link Yours
  accounts to existing social media. For instance, perhaps you have to place
  your Yours public key on your twitter account and your twitter account must
  have at least 100 followers to be used with Yours. This "social media"
  identity feature probably does not belong in Datt itself, and can be included
  in Yours directly.

Thus, the features we need to build in Datt to be used in Yours are:
- A slightly more robust bitcoin wallet (but not lightning network).
- A "centralized blockchain" as a record of content and actions that can be
  signed by Yours.
- A key-value database for storing the actual content and actions.
- No improvements to identity - it's good enough as-is.

I have created a [yoursMVP milestone for
Datt](https://github.com/dattnetwork/datt/milestones/yoursMVP) to keep track of
what detailed issues need to be solved to enable the Yours MVP.
