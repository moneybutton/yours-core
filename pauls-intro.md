Document All The Things
=======================

## Goal

**To prove the feasibility of a P2P publishing market where content ownership remains with the author and moderation choice remains with the user.**

## Principles

**The following principles are essential to DATT:**

 - The network should be uncensorable and users must have final say in content filtering (or the lack of it)
 - Strong anonymity by default, users may optionally assign a stickier identity to themselves via cryptographic signatures
 - We aim for a truly decentralized solution without the need for central servers to hold any content or any registration of users; nor should they be aware of the specific content users are sharing and accessing.
 - Nothing more than a web browser should be required to participate on the network
 - A user should have plausible deniability that they have accepted/stored/consumed/propagated any content item

**Secondary principles that arise from the core principles but are not essential:**

 - Content encryption should be pervasive until a user chooses to decrypt the content
 - Publishers should be incentivised to create quality/popular content


## MVP

There are many contributors working on aspects of the MVP. Some direction and prioritization of MVP features are below.

**It must be possible to:**

 - Post markdown formatted body text with a title | Post a link with a title
 - Distribute post content between peers
 - Sort content for display (chronological, total views, active peers, tips:peer ratio, average comment karma)
 - Comment on posts and have the comments also distribute to peers
 - Tag or Categorize posts
 - Allow for peers to participate as Moderators listing the content that they have curated
 - Create a BIP39 address for the user
 - Monetarily incentivize contributors (Content creators)

**It is desirable to be able to:**

 - Monetarily incentivize network participants (Moderators & Nodes)
 - Optionally include a Title image
 - Crawl link posts to pull a thumbnail image from the source content
 - Display only comments above a defined karma threshold
 - Allow nested comment threads
 - Throttle content submissions to reduce spam
 - Allow users to withdraw funds (CoinJoin?)
 - Derive BIP32/BIP44 addresses
 - Multi-sig addresses between devices the user controls | Multi-sig addresses where a 3rd party controls an address
 - Identity management using signed messages | Keybase.io or other integration for identity

**It is not necessary to:**

 - Allow editing of the body text or title after publishing
 - Decentralize Facebook | Slack | [insert other social/collaboration platform]
 - Integrate directly with existing Bitcoin wallets

