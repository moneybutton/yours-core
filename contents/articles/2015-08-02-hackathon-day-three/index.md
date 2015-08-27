---
title: Hackathon Day Three
author: ryanxcharles
date: 2015-08-02
template: article.jade
---
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
