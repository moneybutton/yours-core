Document All The Things
=======================

## Log

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
- [Brad's overview of the amount of money earned by participants for shared revenue](https://docs.google.com/spreadsheets/d/16vtDV3Ot4lrr2twpUS8Sqgg4OrJ2KIrnQwsuppy56sI/edit#gid=1827203914)
- [Paul's reward allocation model](https://docs.google.com/spreadsheets/d/19mUSGUwLukbskz5dIj1QXM0rAPmCBrbXZeLz908LfmU/edit#gid=1936031705)
- [Paul's DATT Concepts & Principles](https://docs.google.com/document/d/1AEHdOlQMyyuZ3U0a1BOcZtX8kAPWZynFVx9r21NPtiE/edit#)

Related projects
- Blockstack - https://github.com/blockstack - naming, identity, storage
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
