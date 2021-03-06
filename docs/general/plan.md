The Plan (alpha)
================

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

Our plans are guided by our values.

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
decentralized social media app that leverages bitcoin for p2p payments.

With most social media apps, the users are the product and the customers are
advertisers, which is a moral hazard and conflict of interest. With Datt, the
users are the customers, so there is no moral hazard and no conflict of
interest.

## Product

The purpose of the product plan is to specify what we are building and how it
works from the point-of-view of a user.

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
users. We will adopt the notion of a "collective" invented by go1dfish. A
collective is a combination of a label and a set of moderators, which can be
chosen by a user. For instance, a user may post content with the label "music".
There are no objective moderators of the "music" label. However, a user (say,
User A) may subscribe to a collective for the music label moderated by another
user (say, User B). When User A browses this collective, they see the posts
that were either authored or curated by User B. User B can also remove content
from the collective. A user who is a member of a collective is a moderator.

Collectives work exactly like a user's individual page in the sense that the
moderator has to pay people to re-post content to the collective, the moderator
gets paid when people post directly to the collective, the moderator has the
final say over what content appears on the collective (i.e. they can delete
posts on the collective).

Collectives are similar in spirit to subreddits on reddit, but are designed to
solve the problem of moderators that one or more users disagree with.
Collectives are "subjective" in the sense that a user may see different content
under the "music" label than someone else, because they are browsing different
collectives.

## Community

The purpose of the community plan is to identify who our users are, how to
communicate with them, and finding and executing a strategy to service more
users.

[The Original
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

### Core Users

We are building something that is technically sophisticated and it will be a
big challenge to make it easy to use. In some sense, our entire mission is to
make the same technology easier and easier to use over time. Since our
technology is not likely to be easy for normal people to use on Day 1, we
should probably be sure we are at least servicing our core users before trying
to expand in to larger markets. If our core users can't use the technology
first, than we have a huge problem that we will need to fix before we can
expand.

Furthermore, it is remarkable that we even have core users at this stage,
considering we do not even have a prototype. When we launch, we will be able to
gather hundreds or thousands of core users with almost no effort, and all of
these users are disaffected reddit users, bitcoiners, and fans of
decentralization. If we attempt to start with a different community other than
these core users, we would need to be sure we can get the same kickstart that
we would get from these potentially devoted users, which would be difficult.

And lastly, because we are integrated bitcoin payments, we have a significant
bootstrapping problem around how to get bitcoin to the users. Appealing to
bitcoin users on Day 1 ensures that we will have some users who at least
possess bitcoin and are capable of sending that bitcoin to other users (exactly
how to encourage them to actually send bitcoin falls under "product").

In summary, it is valuable at launch to leverage our existing core users. We
should be sure whatever product we create services them well. Although over the
long-term these users will constitute only a minority of our user base, they
will be very important at the start and probably for the duration of our
project. At the same time, we will need to be sure we have a clear plan for
expanding outward from this core user base, since it is not large enough to
sustain our project.

### Initial Growth Step

Our most powerful ally for growth is the network effect if we can leverage it
correctly. In other words, our users need to want to tell their friends to join
Datt. As our users tell more people to join, we will have the ideal outward
growth we desire.

In order to leverage the network effect, first let us assume we able to solve
the product problem of creating incentives to encourage our users to bring on
other users. We will need to make sure we develop features that make it
possible for our users to bring on board an outwardly growing community of more
users. For instance, consider two directions we could take:

* The independent music community
* The finance community

An obvious feature we could develop for the independent music community is to
integrate audio so that users do not have to click out of our app to hear
music, but can hear music from within the app. Contrast that with what type of
feature we would want to build for finance: Perhaps we could integrate
automatic posting of financial news.

The music feature and finance feature are completely different and we probably
couldn't build both at the same time. So which feature should we build? This
depends entirely on who our users are and what direction we should aim to go in
for our growth plan. Without having more information, both music and finance
seem like valid directions. However, I would argue that finance is probably
closer to our core users, since the bitcoin community has some overlap with
finance, while music has no overlap with our current core users, therefore the
network effect would probably be stronger if we attempted to service finance.
This indicates we should focus our efforts on features more appropriate for
finance rather than music.

Note that this discussion is hypothetical - upon launch, we might find data
indicating that we have more overlap with music than finance, in which case we
may choose to focus on that community instead. The point is that whatever
direction we go in needs to be guided by where we are right now, i.e. who our
current users are.

An array of communities to service beyond our core users that movies in the
direction of mainstream would be the following:

* Technology - leverages bitcoin, decentralization communities
* Science - leverages bitcoin, decentralization communities
* News - Top community on Voat, leverages disaffected reddit users

In order to service these communities, we need to identify what features we
should develop that are appropriate for these communities, as well as identify
marketing plans to encourage the growth of these communities on our platform.

### Long-Term Community Plan

Ultimately, Datt should be a mainstream app and a household name. This is
(obviously) a non-trivial undertaking - very few social media apps have
achieved this level of adoption. I would argue that none, including Facebook,
have fully achieved the potential of social media. Being decentralized and
focused on solving the incentives problem, I believe Datt is well-directioned
to target global usage.

There are some key points to keep in mind as we move in that direction. We need
to avoid being locked into small markets, such as bitcoin. Although the bitcoin
community is critical for our early and long-term success, if we attempt to
service only the bitcoin community, we are doomed never to achieve our full
potential. Even if bitcoin itself achieves global adoption, it will still be
the case that most people on the planet do not actually care about bitcoin and
aren't interested in participating in the bitcoin community. To service those
users, we need to be sure we are not locked-in to bitcoin.

## Business

The purpose of the business plan is identify a strategy for earning money, and
raising money, the operations of the business and hiring, and a legal strategy.

### Profit Model

It is common for people to assume that because Datt is decentralized that
therefore there is no business model. This is not true. I believe some of the
same business models that work for centralized business can and will work for a
decentralized business. The only catch is that we are deliberately not trying
to lock-in our users at a protocol level.

For instance, consider the Amazon Kindle. Amazon executed on the vision of
digital books by creating the entire market, including the book devices and the
digital book store. Amazon (almost certainly) attempts to lock-in their users
by making it very inexpensive to acquire a book device, and very difficult to
transfer books from the Kindle to a competitor's product.

Datt is different in that it will be significantly easier for users to avoid
interacting with the company. If they Desire, they can route around the company
and route through competing service providers, using software that we wrote.
This would be a huge problem if Datt acted in a manner to anger or infuriate
our users, who could then leave to competitors while retaining their data and
connections relatively easily.

Whatever our business strategy is, it cannot rely on our users being locked in.
Instead, we must rely on moral authority. It is important that our users
continue to like us, get value from our work, and actually want to pay us. We
must curate customer loyalty by being really good and likeable. We can also
make it really easy to pay us, because payments are integrated into the app.
The customer loyalty problem is primarily a product and community problem.

Assuming our users do indeed like us and are willing to pay us and not
interested in routing around us and going to our competitors, what is our
business plan? We have discussed several strategies for earning money at our
hackathons and in our documents:

1. Be a user of our own app (since users can earn money)
2. Take a cut of payments that occur on the app
3. Offer value-added products and services

I believe 1. is by far the best strategy both for being potentially profitable
and being compatible with all of the other compenents of our project. By being
a user of our own app and trying to profit that way, we are therefore "eating
our own dog food" and will be hyper-aware of ways our product and community are
lacking and will be incentivized to improve our own product not just for our
users but for ourselves.

The way this would work is severalfold: For one, we are content producers.
There is a main Datt account that literally posts original content. At first,
this account would be controlled by one person. We could then expand control to
more than one person. Ultimately we could add a feature that allows the account
to be controlled by multiple parties. This is highly aligned with the goal of
producting communities that can be moderated by multiple individuals. The
"Datt" user account would become its own community that is moderated by several
employees of Datt.

Besides being an original author, Datt would also be a curator and moderator of
content, taking an appropriate cut of payments at each step, in the exact same
manner as the users of our app. If Datt posts original content, we get 80% of
the value. If we re-post content, we get 20%. If we re-re-post, we get 20% of
20%, and so on. Users will also be able to post content directly to the "Datt"
page, which requires no effort on our part and results in revenue. This will
work if the "datt" property is highly trafficked. This will be the case if we
make the homepage of datt.co be the Datt user's home page. i.e., users will
need to pay the Datt user if they want to post content to the homepage.

It will also be possible to build in a (voluntary) cut of payments to each
payment that occurs in the app, which the users would be able to turn off if
they want. However, that is probably not nececssary at first. We can also build
value-added products and services, such as, say, avatar hosting for $1, or
reputation filtering for a monthly fee. Both of these strategies are probably
less effective than simply using the app ourselves, so we should avoid building
in those features until a later date when we have the resources to do it
without distracting from our main focus.

In summary, our business plan is to: 1) Mainain moral authority so the users
actually want to pay us, 2) Be a content producer, curator, and moderator on
our own app, thus dog-fooding our app leading a a positive feedback loop where
we are correcty incentivized to improve the app in a manner that increases both
our profit and the profit of our users.

### Raising Money

Ryan X. Charles has been in touch with a number of investors who we can contact
when we are ready to raise money. The key things to have in place when raising
money are: 1) Identifying the cofounding team, 2) Having a prototype. Also note
that YC applications end on Oct. 13, 2015 and LAUNCH applications end on Oct.
18, 2015.

### Operations

* Who works for the company?
* Who doesn't work for the company but the company needs to work with?
 (open-source contributors, lawyers)
* What do we do on a daily basis?
* How do we organize ourselves?

### Legal

Because our app involves bitcoin payments, which touches on the most highly
regulated subject (banking), we need to be very clued into the law and be sure
we are acting legally. Some key notes:

* By keeping things decentralized where we are not in possession of people's
money and ideally not even involved computationally in relaying the
transactions, we are arguably not any sort of financial business and therefore
are not subject to banking or money transmission laws
* The Bitlicense in New York is so onerous that there may not be any way we can
follow it, and therefore we may have to exclude residents of New York from
being able to use our app.

## Technology

The purpose of the technology plan is to establish how to achieve our goals at
a technical level, including our tech stack, protocols, and high-level software
decisions.

### Basic Technology Outline

Datt is a decentralized content sharing application that integrates bitcoin
payments. It is important that users can post original content, post comments
in response to other users' comments, and make payments to other users. The
payments will probably be voluntary and based on quality content, however there
are many ways we could integrate payments and we are not yet sure what the best
way to do that is, so our protocol needs to be flexible to allow payments in
different circumstances. For instance, we may wish to require a payment of a
certain amount for downloading content, or we me may want to integrate payments
in order to post a response. Although we do not need to solve every conceivable
payment problem in one protocol, our protocol needs to be flexible enough that
if we decided to add a payments feature or change the way payments work, we do
not need to rewrite all the software.

We have considered using a DHT to store content or using something more like
Usenet where the nodes can store all or a subset of content. It is undecided
what the storage strategy is, although for the time-being we are going with the
latter. [See this blog post on
DHTs](http://blog.datt.co/articles/2015-08-26-thoughts-on-dhts/).

### Software

We're building everything in javascript because this is the easiest way to get
on the most platforms with the fewest lines of code. There are only two issues
with javascript: It is insecure if done incorrectly, and it is slow for
cryptography. The first problem can be solved by being very security conscious
and making use of web crypto. The second problem is solved by using both C++
cryptography modules in node and web crypto in a browser.

Our repositories are:

The main repository for datt is at
[github.com/dattnetwork/datt](https://github.com/dattnetwork/datt).

### Peer-to-Peer Protocol

See p2p.md.

### Database

See database.md.

## Conclusion

Our goal is to create an application that correctly incentizes authoring
original content, curating content, and moderating content with p2p payments.
We will start with a core community of disaffected reddit users, bitcoiners,
and fans of decentralization, and expand outward in a logical manner towards a
mainstream audience. We will make money by using the app ourselves as a content
producer, curator, and moderator. Our technology is based on javascript to
enable reaching the most users with the easiest-to-use application with the
littlest engineering effort.
