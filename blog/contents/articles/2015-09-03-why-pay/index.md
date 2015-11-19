---
title: What are Users Paying For and Why?
author: ryanxcharles
date: 2015-09-03
template: article.jade
---

Although the original idea for Datt and most of our mockups assume the users
are tipping content when they upvote something, this is not the only way
payments could work. Perhaps users have to pay before they can see the content.
Perhaps they have to pay before they comment. It is an open question precisely
what it is that users should be paying for.

Dan Elitzer and I have worked out a map of all the things that could be paid
for in a reddit-like community, and what actor would be paying for those
actions.

Viewer
* View link
* View content
* View old content or archival content
* View comment
* View a community
* Follow a moderator
* Follow a content creator

Author
* Post link
* Post content directly
* Post comment
* Reply to comment

Curator
* Upvote
* Downvote
* Highlight content (“gilding”)
* Highlight user (“gilding”)
* Re-share on Datt
* Re-share outside of Datt

Moderator
* Flag as inappropriate
* Create a new community
* Modify content
* Modify comment
* Suggest modification to content
* Suggest modification to comment

Infrastructure
* Host content
* Send content
* Receive content (viewing?)

For each action, do you:
* Pay (how much?)
* Get paid (how much?)
* Neither
* Not have this action as an option

Size of payment:
* $0.01 to $0.05
* $0.05 to $1.00
* $1.00 to $5.00
* &gt; $5.00

The simplest idea is that users pay to reward the producers of good content by
upvoting that content.  This assumes a significant number of users are
interested in charitably rewarding content authors with no expectation of a
return, except to slightly influence the course of the discussion, since
everyone can see how much a piece of content has been tipped. This might work,
but there might also be better ways to integrate payments. There is an enormous
space of possibilities here.

I will sketch out a solution that does not involve charitable payments. Let's
first assume, for simplicity, that there are no sub-communities and no
moderators.

* Viewers do not pay anything to view content.
* Authors do not pay anything to post content to their own profile.
* Authors pay curators to post content to the curators' profile. The curator
can delete the content if they wish, while keeping the payment. The curator
sets the price.
* Curators pay the content author to pin content to the curator's profile.

For instance, an independent artist may post a link to their own music for free
to their own profile. But they may get better visibility if their song was
visible on Kanye West's profile. So the artist pays Kanye West a small fee, set
by Kanye, for their link to show up on Kanye West's profile. In this case, the
author is paying for better visibility (since, presumably, Kanye West's profile
is highly trafficked).

On the other hand, if Kanye West is browsing through links and finds a link to
a good song that Kanye wishes to display on his profile, Kanye will pay the
author of that link to pin it to Kanye's profile. In this case, Kanye West is
paying the author of some content in order to increase the quality of Kanye's
profile, presumably leading to more viewers, which leads to more people paying
Kanye to display their content on Kanye's profile.

This model does not assume anyone must give charitable payments, and yet both
authors and curators get rewarded for the value they produce.

It is possible to add subcommunities and moderators into this picture. Let's
assume we've created subcommunities in a manner similar to go1dfish's
collectives, where a viewer has already chosen a combination of a label (for
instance, "music") and a moderator of that label (together constituting the
"collective").

* Viewers do not pay anything to view content.
* Authors do not pay anything to post content to their own profile.
* Authors pay curators to post content to the curators' profile. The curator
can delete the content if they wish, while keeping the payment. The curator
sets the price.
* Curators pay the content author to pin content to the curator's profile.
* Authors pay moderators to post content to that collective. The moderator can
delete the content if they wish, while keeping the payment. The moderator sets
the price.
* Moderators pay the content author to pin content to the collective.

This is the same as before, except now the author has more choices about where
to post content. The author could still pay Kanye to post content directly to
Kanye's profile, or the author could post to the "music" collective containing
Rolling Stone as a moderator. If Rolling Stone likes the content, they keep the
content, and they get paid. If Rolling Stone doesn't like the content, they can
delete the content, and they still get paid. The value they produce is to
maintain a high quality collective, and they get paid for the work of
moderating it.

On the other hand, it could be that the independent artist posted something
directly to Kanye's profile, and not to Rolling Stone's collective. Rolling
Stone noticed the link on Kanye's profile and wishes to copy it to their
collective. They must pay the content author to be able to do that.

The advantage of collective is that they can be more general, such as "music",
and can be moderated by multiple individuals. Either the moderator of the
collective gets a separate payment, or perhaps they split the payments.

There is a huge space of possibilities for integrating payments into content,
and there could be thousands of different applications that apply a different
twist to how the payments and content mix. Some of these applications would not
be useful or profitable, and some would be extremely useful and profitable. We
therefore shouldn't feel locked in to any one solution, because we might not
find the best one at first. We might wish to experiment with different
solutions in order to find the best one (or many).
