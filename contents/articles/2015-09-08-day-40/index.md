---
title: Day 40
author: ryanxcharles
date: 2015-09-08
template: article.jade
---

This is the 40th day since the first day of the first hackathon ([July
31](/articles/2015-07-31-hackathon-day-one/)), which is when we officially
started working on Datt. Some things that have happened since the [last
update](/articles/2015-08-29-end-of-week-four/):

### Blog post

[What are users paying for and why?](/articles/2015-09-03-why-pay/) - a blog
post about all the different things people could pay for on Datt, and their
motivations for doing so. We shouldn't assume that the best way to pay is
through voluntary tips. This blog post sketches out a framework for
determining alternatives that might be better for the users.


### Tweet about how to bootstrap bitcoin usage

[If you were to create an app that required bitcoin, how would you get
bitcoin to the
users?](https://twitter.com/ryanxcharles/status/641322665337331712) - I posed
this question on Twitter and got a decent response. Unfortunately, no one
really has a great answer to this. First of all, since the users can earn
bitcoin on Datt, this is potentially less of a problem for us than for some
other apps, however that does mean we are dependent on people who already have
bitcoin to provide bootstrapping for us. An alternative is to earn money from
advertising and pay users in bitcoin for creating content that draws ad views.
Mark Finelli sent me a really detailed response that I haven't thought through
yet.


### Presentation at IDEO

I gave a presentation at IDEO last week. [Here is a copy of the
presentation
(PDF)](https://github.com/dattnetwork/dattdocs/blob/master/presentations/2015-09-02%20IDEO.pdf).
The presentation was designed to be short and to spark a conversation. Many of
the points that came up during the conversation had already come up on Slack or
at previous meetups, however they bear repeating. The takeaways are:

1. It's hard to build a community - we should probably find one non-bitcoin,
non-decentralized, non-disaffected-reddit-user community to focus on and make
sure we solve that community's needs.
2. We need to be clear about what our principles are, such as "users own their
content."
3. The psychology of gilding on reddit is very relevant to us - we want users
to want to pay each other.
4. What if you could trace memes back to the original authors, sort of like how
GitHub lets you see who made a particular commit in a project, or let you fork
someone's project?
5. Text is a good way to start, but we should be eager to get into audio and
video later.

### Prototype

We're scheduled to finish the prototype in two days. Although we have made some
significant progress on [datt-node](https://github.com/dattnetwork/datt-node)
over the past week and a half, most especially Johan's excellent work on
content discovery, I don't think we will realistically have a prototype with
comments and bitcoin payments finished in two days. We shouldn't feel bad about
this - the September 10 deadline was arbitrary and was only set when someone
asked me back on August 10 how long it would take to make a prototype, and I
said, "oh, I don't know, about a month." Now that we have learned a lot more
about our own project, we are in a much better position to come up with
realistic timelines.  I'll still be working on the code over the next two days
and try to finish the prototype, but whatever the status is on that day, I will
try to plot out some more realistic timelines based on everything that has
happened since we started.

### Press

[CoinDesk had an
article](http://www.coindesk.com/datt-decentralized-reddit-bitcoin/) and [Money
& Tech had an interview](http://moneyandtech.com/ryan-x-charles-reddit/).

### General stats

* 141 people on Slack
* 173 followers on Twitter
* ~150 email signups

### Montreal

I will be heading to Montreal from September 11 - 14 for the [scaling bitcoin
workshop](https://scalingbitcoin.org/montreal2015/) as an invited "academic"
speaker and will also probably be hosting a roundtable. I will be advocating to
increase the max block size soon, and not to wait for the lightning network or
sidechains. Although I believe increasing the max block size is insufficient
for scaling bitcoin long-term, it is much, much easier and nearer-term than the
lightning network or sidechains. I will put my full argument in the form of a
presentation which I will share publicly. [I have also previously shared some
thoughts on this back in
May](http://lists.linuxfoundation.org/pipermail/bitcoin-dev/2015-May/008190.html).
