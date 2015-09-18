The Plan
========

* [Introduction](#introduction)
* [Values](#values)
* [Goal](#goal)
* [Product](#product)
* [Community](#community)
* [Business](#business)
* [Technology](#technology)
* [Conclusion](#conclusion)

## Introduction

Datt is a product, community, business and technology spawned from turmoil that
occurred in the reddit community in the summer of 2015 and originates from the
article ["Fix reddit with
bitcoin"](https://medium.com/@ryanxcharles/fix-reddit-with-bitcoin-7da3f85fb9ba)
by Ryan X. Charles.

Work on Datt began on July 31, 2015 at an [international
hackathon](http://blog.datt.co/articles/2015-07-31-hackathon-day-one/). Product
plans, community plans, business plans and technology plans for Datt were
initiated on that day and have been developed since then. All aspects of Datt
have been discussed and have preliminary plans, but some of the plans have
logical inconsistencies between them. The purpose of this document is to
compile all of our plans into one coherent master plan that encompasses the
entire project.

This plan is based on work by Ryan X. Charles, Paul Salisbury, Dan Elitzer,
Ramakrishnan A, Bradley Kam, Guillaume Dumas, Willy Bruns, Lisa Cheng, and
others.

## Values

Our plans did not come out of thin air, but are guided by our values.

### Transparency

By being transparent about what we are doing, people inside and outside of our
community can be empowered to offer input. This applies to our software, which
is open-source, as well as all other intellectual capital we produce, such as
our business plans and legal strategies. Pretty much everything is better kept
open, except keys.

### Decentralization

Although it is common for companies to build products that lock-in users at a
protocol level, we believe it is better that people use our products and
services because they get value from them, rather than because we have built a
barrier to exit. If users are not choosing to use our products or services,
this is a valuable sign that we are not building the right thing.

### Adlessness

Advertisements are almost always annoying, violate privacy, and do not offer
enough revenue for media platforms. Rather than build a business model based on
advertisements, we are interested in alternative forms of revenue based on
around p2p payments.

### Design

We are attempting to make a mainstream product that should be easy to use and
powerful for normal people, while being based on technology that almost no one
understands. This will only be possible with a very thoughtful approach to the
user experience.

### Experiment

We're building something new, but we don't know exactly what to build or how to
build it. Rather than commit to solutions that we don't actually know will
work, we value experimentation so that we can learn what to do. We will never
have all the answers, so we must continue to experiment indefinitely.

## Goal

Our goal is to solve the incentives problem of social media so that users get
financially rewarded for their work producing, curating and moderating content,
and companies can earn money not by selling their users' private information
but by participating in the system as equals. We are doing this by creating a
web-first, mobile-second decentralized social media app that leverages bitcoin
for p2p payments.

With most social media apps, the users are the product and the customers are
advertisers, which is a moral hazard and conflict of interest. With Datt, the
users are the customers, so there is no moral hazard and no conflict of
interest.

## Product

The purpose of the product plan is to specify what we are building and how it
works from the point-of-view of a user. The product plan does not specify why
we are building it or who uses it (see The Community Plan), how to build it
technically (The Technology Plan), or how to monetize it or how to build it
operationally (The Business Plan).

### Overview

Users may perform many actions, such as signing in, posting a original comment,
posting a comment in response to another comment, and even hosting content and
serving it to other users. We are integrating a payment mechanism to make it
possible for some actions to involve payment, either required or voluntary.
There is a huge possible space of what types of content the users will be
creating and curating and whether those actions cost money, who gets paid, and
how much.

The main problem is to incentivize the production, curation and moderation of
valuable content. The users should want to post good content, curate good
content, and moderate good content, because they get value from doing so. They
should also want to pay for content because because they get value from it. It
is not necessarily the case that the users will want to pay so that they can
view content - it could be that users want to pay so that they can influence
the course of a conversation, or want to support an author.

We will sketch out a solution. As usual, we should be open to changing the
product plan if it doesn't work or if something else is found to work better.

### Product Plan 1

Authenticated users can perform the following actions:
- Post content to their user page, which is free.
- Re-post content from another user's page, which costs $0.25, paid to the
  author. If the user is re-posting something that was already re-posted, then
  the re-poster gets 20%. Each re-poster in the chain gets 20% of the
  remainder.
- Post content to another user's page, which costs $0.25, paid to that user.
  Each user moderates their own page and can remove content they don't like.

Datt owns the Datt page which is visible on the front-page of datt.co. Users
can pay $0.25 to post content to Datt's page. In other words, users can pay
$0.25 to post content directly to the front-page. Users that do not wish to pay
can post content directly to their own profile for free. If a user does not pay
to post content to the front-page, but Datt discovers it and likes it, Datt can
re-post the content to the front-page by paying the author $0.25, minus the 20%
taken by each re-poster in the chain.

Note that there is no "tipping" in this plan. Users do not tip comments. They
pay the author to make the content visible on their own page. They get value
from this by making their own user page more attractive, which should draw more
viewers, who will pay to re-post content from their page. Thus while a user may
pay $0.25 to re-post some content to their page, if their page is highly
trafficked they could earn more than $0.25 in re-posting fees from other users,
thus earning more than $0.25.

Since Datt is decentralized, users may run a node on their domain name and make
their own content visible on their own front-page.

### Product Plan 2

The first product plan has a notion of original content, user pages, and
re-posting content, but it does not have a notion of comments. The second
product plan modifies the first by adding comments. Users may comment on any
content they see. Their comment is visible on their own page, with a link back
to the original content. If the user wishes their content to appear beneath the
original content, they must pay $0.25, which goes to the author of the content
along with 20% to the re-poster (and other re-posters in a chain).

Like with original content, users can re-post comments. When users re-post, the
author of the comment gets $0.25, with 20% going to the re-poster (and other
re-posters in a chain).

In this model, users can comment for free, but their comment is only visible on
their own page. A user can achieve greater visibility by paying to make their
comment visibile on the original author's content. This is a cost for the user,
but is potentially profitable if enough other users see their comment and
re-post it to their pages.

Like with the first plan, this plan does not assume the users will voluntary
tip any content. The users are either posting comments for free to their own
page, or paying to post a comment in a place with greater visibility, or paying
to re-post someone else's comment and thus give it better visibility.

### Product Plan 3

We would like to add a notion of sub-communities that are moderated by multiple
users. 

## Community

The purpose of the community plan is to identify who our users are, how to
communicate with them, and establishing a strategy to service more users.

[The
Original
Article](https://medium.com/@ryanxcharles/fix-reddit-with-bitcoin-7da3f85fb9ba)
drew interest from three camps of people:

1. Disaffected reddit users
2. Bitcoin users
3. Fans of decentralization

These groups consitute our core community at the present time. However, we aim
to produce a mainstream social media app, which should have many people not in
these groups. We need to find a way to service our core community while
expanding outward to to a greater and greater audience until we service every
person, robot, and alien in the world.

Some key questions are:

1. Should we focus on our core user base upon launch, or should we aim to
service a larger user base on Day 1?
2. What other community or communities should we focus on besides the core
community?
3. What is our marketing and growth plan to service our target commities?

## Business
* Profit model
* Operations
* Legal

## Technology
* Technology Stack
* Peer-to-Peer Protocol

## Conclusion

## References
