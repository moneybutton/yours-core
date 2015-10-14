---
title: YC Application & Towards a Prototype 3
author: ryanxcharles
date: 2015-10-14
template: article.jade
---
For most of the past month I've been focused on building a prototype. See the
[first](/articles/2015-09-27-towards-a-prototype/) and
[second](/articles/2015-10-05-towards-a-prototype-2/) blog posts about that.
However, for the past few days, I took some time off from the prototype to
apply to Y Combinator, which is the premier startup accelerator and would be an
ideal step at this particular stage of the project. [Here is my founder
video](https://www.youtube.com/watch?v=5czAPqTKHxw) for the application.

Given that I had the help of several people including two YC alums to create
the application, and I have met some of the people reviewing the applications,
I would say that my odds of being accepted are greater than most, but still not
greater than about 50/50, because the universe is random and unpredictable.

Either way, I think the plans moving forward are approximately the same. My
goal is to "launch" an invite-only prototype by mid-November and invite a
select audience to view, but not use, the product and provide feedback. I will
record a video using the prototype which I will advertise on social media to
get a small amount of attention for the project, which I will use to initiate
fund raising.

I've put a good deal of thought into the timelines currently listed on the
GitHub [milestones](https://github.com/dattnetwork/datt/milestones) and
[issues](https://github.com/dattnetwork/datt/issues). The basic thesis is this:

- A minimalist, non-launchable but working prototype that includes content
  sharing and bitcoin payments by October 26. We then make preparations to
  share this with the selected invite-only audience.
- The "MVP alpha", which is something that our invite-only audience can
  actually use, by December 8. We do not necessarily need to launch anything at
  this time - this is primarily a benchmark time that the app should be pretty
  usable at this point.
- The "MVP beta", which is refined enough to actually launch to our core users,
  by January 25. We don't necessarily do much advertising at this point - just
  make sure the product works well for people.
- The "launch", which is a final version that is launched to a general
  audience, by March 14. We will need to be pepared with a concrete community
  plan which we begin executing to advertise and drive the growth of the
  community.

It will not be easy to meet these deadlines, but I think it is possible, and
it's not desirable to delay a general launch any more than this.

The primary thing that has happened recently in the software is that the p2p
connections are partially working, but not finished. There are still no bitcoin
payments. Here are some closed issues relevant to the p2p connections:
- [dattcore: Peers: ConnectionBrowserWebRTC can connect browser <-> browser with PeerJS](https://github.com/dattnetwork/datt/issues/60)
- [dattcore: Peers: NetworkBrowserWebRTC: make new connection](https://github.com/dattnetwork/datt/issues/61)
- [dattcore: Peers: NetworkBrowserWebRTC: Receive new connection](https://github.com/dattnetwork/datt/issues/62)
- [dattcore: Peers: send ping/pong messages](https://github.com/dattnetwork/datt/issues/63)
- [dattcore: Peers: Make Peers class to manage Networks](https://github.com/dattnetwork/datt/issues/64)
