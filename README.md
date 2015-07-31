Document All The Things
=======================

## Thoughts from Niran:

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
system, and servers that collect that data, index it in useful ways, and serve
it over read -only APIs. It probably isn't feasible for each client to piece
together all the votes and submissions to generate a subreddit, but as long as
anyone can launch a server that does that, the promise of decentralization is
maintained. If the server relays submissions of votes, comments and submissions
to the decentralized backend that the system runs on, this also avoids the
dependency on a local daemon that many decentralized tools. Hosting one of
these servers is a small to medium opportunity for profit.

- Ethereum, Whisper and Swarm/IPFS. Using the best toolkit for decentralized
applications is a huge advantage. It makes it less likely that someone will
start a new decentralized reddit project that isn't a benevolent fork of this
one. One of the huge advantages of decentralized apps is that if built right,
the user base never splits even with competition. Each competitor builds on top
of what already exists to benefit from the existing user base. That won't
happen if your system is hard to build on.

- You probably only need a blockchain (Ethereum's, hopefully) for a tiny
fraction of the functionality. The identity of each subreddit probably needs to
be on a blockchain so it's easy to pull down all of them. Once you have a
subreddit identity, you can just listen for people broadcasting data for that
subreddit over Whisper: moderator candidates, new comments, posts and votes,
the location of historical indices, etc.
