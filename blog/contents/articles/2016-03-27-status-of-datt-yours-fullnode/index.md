---
title: "Status of Datt, Yours and Fullnode"
author: ryanxcharles
date: 2016-03-27
template: article.jade
---
Updates since the hackathon:
- Darren M has created beautiful new layouts for Yours based on some mockup
  work by Steven McKie. The new layouts include the hot page, all page, wallet
  page, and submit new content page.
- Yours has been rewritten (almost) from scratch. The most significant change
  is that depend on a database hosted on AWS, Yours now uses the Datt database
  on the server (and client, as before).
- Clemens Ley is visiting San Francisco, and we are working on getting
  something launchable out soon. The Yours product has also changed slightly -
  rather than endorsing a random earlier endorser, you now endorse all earlier
  endorsers evenly. We haven't yet integrated Darren's layouts into the Yours
  UI.
- Yours now sorts content on the front-page more like reddit, where the most
  "upvoted" content reaches the top spot.
- We have removed the UI from Datt since we are now focused on building the UI
  for Yours, and don't want to maintain both UIs are the same time. Datt should
  still have its own UI intended for a technical udience, but that can be added
  later. Philosophically, we now consider Datt to be a backend that can power
  many possible products, of which Yours is just one example.
- Fullnode has a new worker interface that is being use extensively both
  throughout Fullnode itself and throughout Datt. The interface is very easy to
  use - all common methods that need to be put in a worker now have "async"
  versions, e.g. the async version of bip32.toString() is simply
  bip32.asyncToString().
