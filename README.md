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


## Log

### End of Week 1, Aug. 7, 2015

#### Summary by Ryan X. Charles

It's been one week since we started the hackathon and actually started working
on Datt. We've made some fundamental progress since the hackathon ended,
including further design work, further UI work, improved business plans,
improved community plans, improved architecture designs, improved p2p work, and
overall a more focused direction for the project. We also have a nice round
number of 100 users in the Slack channel - pretty good for one week.

I've talked with many people outside of the core contributors who are
interested in this project, including investors. Although we are not trying to
raise money at the moment, I've learned a lot about what we should probably do
to raise money. For one thing, the longer we can bootstrap, the better. The
more solid our prototype is and the more committed our team is, the better our
terms will be when we raise money.

On the note of outside interest, I'm in touch with several blockchain companies
that have expressed interest in hiring blockchain engineers. If you are a
blockchain engineer who might be interested in joining a company other than our
own, please contact me and I can put you in touch with these people.

I believe the path forward at this point is to focus on these core areas: 1)
Technical/Security, 2) Design/product, 3) Community, 4) Business. All of these
are key and should be weighted equally. The technical work is occuring in the
datt and datt.ui repos, design/product in both datt.ui and the dattmedia repos,
community in the dattdocs repo as well as on Slack, and business on the
dattdocs repo and Slack.

We're moving forward with implementing the core codebase in javascript. This is
the shortest path to market, but it has one drawback - cryptography is slow in
javascript, and arguably insecure to due timing issues (though that's
debatable). That is not a problem server-side, where we can link to C++ or C
cryptography. We can also make used of child process forks (node) and web
workers (browser) to ensure the networking and UI are non-blocking and
responsive. (Unfortunately, threads in node, though technically possible, are
not mature, and don't allow using C++ code, so that is not an option.)
Long-term client-side, where possible, we should to try hook into bitcoin
wallets and other services to offload some of the cryptography onto specialized
apps.

I believe our design and product work right now is very good and frankly better
than my expectations for  MVP.  The priority there should be to integrate the
graphical mockups into the datt.ui code. We also need a landing page. It's
possible I haven't thought of some important uses of design, so any designers
should feel free to do any other design work that they feel is appropriate. On
Aug. 18, I will begin working from the IDEO office. I'm extremely excited about
the possibility of a relationship with them.

The architecture will be with one repo for the UI, one for the node, and one
for putting the two together. That work is ongoing.

I believe we can target a mainstream community, although our core audience
consists of disaffected reddit users, the decentralization community, and the
bitcoin community. We should make sure our product services their needs first,
while ensuring the direction we take is compatible with going mainstream in an
iterative fashion. We need to create a plan for how to first service our core
users, and then how to expand outward.

We have several distinct business plans, but I believe the best is around
basically giving a cut of payments to the moderators and nodes. The First
Company aims to be the largest and best branded node, and will take a share in
revenue of tips and other payments. The payments are voluntary, because users
can route around the company. However, so long as the company maintains moral
authority (i.e., the users like us), I believe most users will not choose to
route around us. It is a key design choice that the users can route around us
if they so choose - I believe this will help build moral authority. We need to
refine our plans and prepare materials that is suitable for investors.

This week has been wonderful and I'm very please so many people have joined the
project. We have another mini-hackathon taking place tomorrow in Sunnyvale
(please contact Willy for details), and of course we will also be on Slack.
I'll be sure to bring a camera so that people who are online-only can possibly
join a Google Hangouts during the event.

I will also be personally contacting people working on the project to figure
out how you might like to be involved in the company, either at the level of
cofounder, employee, contractor, or other. I will begin that next week.

### Hackathon Day 3, Aug. 2, 2015

#### Summary by Ryan X. Charles.

The last day of the hackathon - I'm delighted with the progress we have made.
We have beautiful mockups, realistic and highly profitable business plans, and
a variety of workable technical solutions to choose from, and even some actual
code. There are now a total of 85 people in the Slack channel with 3816
messages in 5 public channels, and 10 contributors on GitHub, who have all
contributed something to make this possible. All in only one weekend.

We started out the weekend with three primary goals, and I'd like to summarize
as best I can the status of these three goals.

1) Establish a minimal product plan.

This hackathon started with a notion of a "decentralized reddit where karma is
bitcoin", and the product mockups and design work have sketched out a much
better vision of this than words could justify. Chris' design work in
particular is absolutely excellent, [available on the dattmedia git
repo](https://github.com/dattnetwork/dattmedia).

Almost everyone agrees the correct way to build this product is to be
completely decentralized with no central point of failure. Users should own
their content, and be free to take their content, identity, contacts,
moderation activities, and everything, with them from node to node. If a user
has a bad experience with a content producer, moderator, or host, they should
be free to block, ignore or route around the problem so that the network
continues to function for them without having to leave.

We are moving forward with text-based content, and putting aside audio and
video for the time being. Upvotes will probably be based on bitcoin payments,
downvotes may be as well, "gilding" may still be possible. Moderation is
absolutely critical and it is important we figure out how to provide good tools
to moderators and market-based incentives for good moderation. This is
explained a little bit more in the business plan.

2) Establish a workable business plan.

Many business are designed around a centralized approach, particularly social
media apps that de facto own the users' content. Datt is designed to be the
exact opposite. At first glance, this presents a problem for businesses. If
there isn't a business at the middle, how can they possibly earn money? The
problem is artificial. Not only can businesses earn money on a decentralized
platform, such a platform is a better win-win proposition for all the
participants.

The best business plan put forth is for content producers and moderators to
take a voluntary percentage of payments with a market-based economy for
choosing the best moderators and hosts. Users will be drawn to moderators that
are better at curating content, and those moderators can charge higher fees.
Content producers will choose those moderators, because profits are higher for
everyone. The same thing is true for nodes - nodes that serve and relay content
fast, easily and reliably will be the most popular and able to take a larger
voluntary cut of revenue. By finding the optimal amount, not so high that
content producers are swayed elsewhere, and no so low that the moderators or
hosts can't afford reinvest in their own business, a profitable win-win
equilibrium can be found by the market.

3) Establish a technical direction.

There are many projects underway unaffiliated with datt that we can either
adopt or leverage. Some examples are bitcoin and its variety of
implementations, ethereum, aether (unrelated to ethereum),
converse/fabric/maki, Tradle's tech stack, Backfeed, and others (see some of
the references in this document for more). Besides that, there are basic
questions to answer, for instance what language to use for the implementation.

We have not settled on concrete answers for any of these, however we do have a
general direction. We are moving forward with leveraging bitcoin, for one. Most
work on integrating payments assumes bitcoin is being used. We are also moving
forward with web technologies such as Web RTC, web sockets, and Indexed DB,
which allow people running the app from a web browser to participate quite
fully, albeit not quite completely (e.g., connecting to the bitcoin p2p network
and running a rendezvous server are not possible from within a web browser).
There is also a clear preference for Ember as a front-end framework, and node
and/or io.js for the backend.

In my honest opinion, javascript is the best option to create the MVP because
this will allow us to write the fewest lines of code which can be shared
between the server (i.e. the "full node") and browser (the "light node") and
reach all platforms. It is the shortest way to MVP.  Ultimately, we will want
to rewrite the backend in Rust, Go, Java or something else more performant than
javascript.

In conclusion, I think we made about as much progress as we could have dreamed
in one weekend. We are trying to build something that is both technically
complicated and with very delicate incentives that must be chosen appropriately
for the thing to work. We do not have a fully working prototype yet, but we
have a solid foundation to make a prototype possible within weeks or months.


### Hackathon Day 1, July 31, 2015

In just two days of invites, we've managed to gather 59 people to join the
Slack channel!

Priorities:

- Establish minimal product plan, including mockups (subject to change, of
  course, depending on technical choices and UI decisions - the goal is to just
  come up with something minimal that provides a good direction for the UI).

- Research technologies, and establish basic technologies for a prototype
  (technologies are subject to change - there are a lot to choose from, and we
  haven't had time to research them all yet).

- Establish basic business plan. Although the network is decentralized, there
  are still lots ways to earn money, because each node can accept payments. The
  business plan doesn't have to be final, but rather more of an example of the
  way a business might be able to earn money from running a node.

## Resources and related projects

Documents generated during the hackaton
- [Brad's business-focused mockups](https://docs.google.com/presentation/d/1SlSlpEtZWa6g3jddrFdpY0hL9W8YePWItrOV0W4bPyc/edit#slide=id.g63d6e66a7_0_200)
- [Brad's overview of the amount of money earned by participants for shared revenue](https://docs.google.com/spreadsheets/d/16vtDV3Ot4lrr2twpUS8Sqgg4OrJ2KIrnQwsuppy56sI/edit#gid=1827203914)
- [Paul's reward allocation model](https://docs.google.com/spreadsheets/d/19mUSGUwLukbskz5dIj1QXM0rAPmCBrbXZeLz908LfmU/edit#gid=1936031705)
- [Paul's DATT Concepts & Principles](https://docs.google.com/document/d/1AEHdOlQMyyuZ3U0a1BOcZtX8kAPWZynFVx9r21NPtiE/edit#)
- [aramkris view of Business Model - Updated post the hackathon] (https://github.com/dattnetwork/dattdocs/blob/master/DATTmodel3.md)
- [aramkris view of shared revenue - Updated post the hackathon] (https://docs.google.com/spreadsheets/d/1_M0KyHaBJqUIOl4KDZYYpE3gSyq8XhAQEy1csPABiHw/edit?usp=sharing )

Related projects
- Blockstack - https://github.com/blockstack - naming, identity, storage
- [nntpchan](https://github.com/majestrate/nntpchan) - a decentralized image board with opt-in moderation
- aether - http://getaether.net/
- empeopled - https://empeopled.com
- colony - colony.io
- backfeed - backfeed.cc
- http://lazooz.org/
- http://www.decent.ch/ 
- Qora - http://qora.co.in:9090/index/main.html

Resources compiled by John Villar
- [PeerJS](http://peerjs.com/) - Easy WebRTC
- [FreedomJS](http://www.freedomjs.org/) - Another Easy WebRTC
- [GUN.js](http://gun.js.org/) - NoDB High replication memcache
- [PouchDB](http://pouchdb.com/) - A clientside CouchDB-like database that syncs when online with a CouchDB server
- [WebTorrent](https://github.com/feross/webtorrent) - Torrent, for HTML5
- [MaidSafe](http://maidsafe.net/) - A blockchained coin/storage
- [BitcoinJS](http://bitcoinjs.org/) - Bitcoin's JS Swiss knife
- [Coinspark](http://coinspark.org/) - Smart contracts on the blockchain (non-js)
- [Codius](https://codius.org/) - Smart contracts on the blockchain (js)
- [Key-hq](https://www.npmjs.com/package/key-hq) - BIP32 compliant HD keychain
- [Bitcore](https://github.com/bitpay/bitcore) - bitpay's javascript implementation of bitcoin
- [bcoin](https://github.com/indutny/bcoin) - chjj's implementation - has SPV support in node
- [fullnode](https://github.com/ryanxcharles/fullnode) - ryanxcharles's implementation - similar codebase to bitcore, but monolithic, and written in ES 2015
- [webcoin](https://github.com/mappum/webcoin) - an SPV node that works in a browser, based on bitcore
- [Bitmessage](https://bitmessage.org/wiki/Main_Page) - Blockchain specifically dedicated to messaging, think SPV client but with messages, anonymous identities and proof of work message requirement (non-js).
- [NPM Bitmessage](https://www.npmjs.com/package/bitmessage) - Bitmessage Node.js implementation supporting browserify, alpha quality, still no outgoing connection on browser.
- [Bitmessage-node](https://github.com/RexMorgan/bitmessage-node) - Bitmessage API library, piggybacks on native Bitmessage installation
- [BitID](https://github.com/bitid/bitid) - Public key based authentication using Bitcoin Wallets facilities
- [Blockstack](http://blockstack.org/) - Very similar project to Datt
- [Ephemeral](https://github.com/losvedir/ephemeral2) - Ephemeral content stored only by the viewers of it
- [UX Methods &amp; Design](http://uxdesign.cc/ux-methods-deliverables/) - UX/UI design cheatsheet
- [Paul's Datt doc](https://docs.google.com/document/d/1AEHdOlQMyyuZ3U0a1BOcZtX8kAPWZynFVx9r21NPtiE/edit#heading=h.65lcma1tm8an)

Bitcoin, lightning network, sidechains
- [A fast and scalable network with bitcoin micropayment channels (PDF)](http://www.researchgate.net/profile/Christian_Decker5/publication/277991245_A_Fast_and_Scalable_Payment_Network_with_Bitcoin_Duplex_Micropayment_Channels/links/55780a4e08aeb6d8c01cf2d0.pdf) - not lightning, but similar

Articles
- [Mutually Assured Content](http://www.theawl.com/2015/07/in-no-charts)
- [Don't display negative karma](http://www.raphkoster.com/2009/10/07/building-web-reputation-systems-the-blog-the-dollhouse-mafia-or-dont-display-negative-karma/)
- [Rating Systems - Christopher Allen](http://www.lifewithalacrity.com/2005/12/collective_choi.html)
- [Dunbar, Altruistic Punishment, and Meta-Moderation - Christopher Allen](http://www.lifewithalacrity.com/2005/03/dunbar_altruist.html)
- [The Web We Have to Save](https://medium.com/matter/the-web-we-have-to-save-2eb1fe15a426)
- [The Cryptographic Doom Principle - you should always encrypt then mac - validate mac before decrypting data](http://www.thoughtcrime.org/blog/the-cryptographic-doom-principle/)
- [Web RTC STUN and TURN](http://www.html5rocks.com/en/tutorials/webrtc/infrastructure/)
- https://valme.io/c/journal/c_prompt/f5qqs/an-open-letter-to-steve-huffman-reddits-new-ceo-with-an-offer-to-exchange-values (general business model ideas)
- http://valme.io/c/gettingstarted/faq/nqqqs/why-does-it-cost-1-karma-to-upvote-but-2-to-downvote (related to downvoting)
- http://valme.io/c/gettingstarted/faq/yqqqs/whats-a-sponsored-account (related to allowing mods to change the price of content)
- http://valme.io/c/gettingstarted/faq/7mqqs/valme-transaction-costs (related to different transaction fees for different actions)
- http://valme.io/c/gettingstarted/faq/5qqqs/whats-a-modqueue-what-are-moderators-mods (related to flagging/downvote brigades)

## Brainstorms and thoughts

### Thoughts from Niran:

- Using money for upvotes isn't really a feature. It's not necessary to
  decentralize reddit. What is wrong with reddit that money fixes?

- Subreddits, not tags. Tags mean one submission has several audiences with one
  comments section. Subreddits divide comments in very useful ways. The
  moderators define not just the submissions, but the culture of the comments.

- Users should be able to pick their own moderators for a subreddit. A
  subreddit is a topic and an ethos, but that's orthogonal to who the enforcers
  of the topic and ethos are.

- Maybe each moderator is effectively a publisher of the entire subreddit.
  Filtering out garbage content happens on their machine, assisted by rule sets
  like user bans, anonymity bans, trusted commenters, and trusted fellow
  moderators to import rule sets from. They publish their results to a
  decentralized content store, like IPFS or Swarm.

- I think it's going to be useful to think of the backends of decentralized
  applications as two parts: live data that users send to participate in the
  system, and servers that collect that data, index it in useful ways, and
  serve it over read -only APIs. It probably isn't feasible for each client to
  piece together all the votes and submissions to generate a subreddit, but as
  long as anyone can launch a server that does that, the promise of
  decentralization is maintained. If the server relays submissions of votes,
  comments and submissions to the decentralized backend that the system runs
  on, this also avoids the dependency on a local daemon that many decentralized
  tools. Hosting one of these servers is a small to medium opportunity for
  profit.

- Ethereum, Whisper and Swarm/IPFS. Using the best toolkit for decentralized
  applications is a huge advantage. It makes it less likely that someone will
  start a new decentralized reddit project that isn't a benevolent fork of this
  one. One of the huge advantages of decentralized apps is that if built right,
  the user base never splits even with competition. Each competitor builds on
  top of what already exists to benefit from the existing user base. That won't
  happen if your system is hard to build on.

- You probably only need a blockchain (Ethereum's, hopefully) for a tiny
  fraction of the functionality. The identity of each subreddit probably needs
  to be on a blockchain so it's easy to pull down all of them. Once you have a
  subreddit identity, you can just listen for people broadcasting data for that
  subreddit over Whisper: moderator candidates, new comments, posts and votes,
  the location of historical indices, etc.
