---
title: "How to Help Build Datt"
author: ryanxcharles
date: 2016-02-22 01:00:00
template: article.jade
---

Datt is a decentralized, blockchain-based social media platform and application
designed to make it easier to find quality content and to allow content
creators, curators and moderators to be paid for their work. The content is
stored on a p2p network, and the bitcoin blockchain is used for payments and
censorship-resistance features. Datt is also known as the "decentralized
reddit" project, although the end-product is not necessarily intended to
replace reddit. It was founded by Ryan X. Charles, the former cryptocurrency
engineer of reddit.

The idea behind Datt is twofold: First, the missing ingredient in all previous
attempts to make a decentralized social media application was incentives.
Diaspora, for instance, did not have a notion of payments, so the participants
were not strongly incentivized to use the application. Only people
ideologically in favor of decentralization adopted the platform, but mainstream
users did not. Everyone, including mainstream users, respond to financial
incentives.

The second, complementary idea is that the reason why bitcoin or other
blockchains have yet to reach a genuine mainstream audience is that they were
missing a killer app. We believe social media is the best killer app for
bitcoin and blockchain technology. By building a mainstream social media app on
top of these technologies, we will be able to provide an experience that is not
possible any other way. Many mainstream users will be introduced to these
technologies for the first time thanks to Datt.

Datt is open-source and invites contributions from anyone who wants to help.
There are two primary ways we organize activity to help build Datt: The first
is our Slack channel, which serves as our headquarters of communication. You
should sign up for our Slack channel
[here](http://datt-slackin.herokuapp.com/). You should read what people are
saying in Slack, and consider scrolling back through history and reading older
comments in the Slack channel to have a better idea what has been done and what
is going on.

The second means we use to organize activity is GitHub. The main Datt repo at
[github.com/dattnetwork/datt](https://github.com/dattnetwork/datt) has all of
the code for the main application including backend ("dattcore") and frontend
("dattreact"), the blog, the landing page, the documentation, and design work.

Here is an overview of the folders you will see in the main repo:
- bin/ - Executable files, particularly for running the app servers.
- blog/ - The blog content and source.
- build/ - Static files and build files for the browser.
- core/ - dattcore - The core logic of p2p, database and API.
- docs/ - Documentation on business, product, community, technology.
- ember/ - The Ember UI, currently unmaintained.
- landing/ - The landing page content and source.
- media/ - Logos, mockups, and template HTML.
- react/ - dattreact - The React front-end.
- server/ - The Datt servers: app server and rendezvous server.
- test/core/ - Tests for dattcore.
- test/react/ - Tests for dattreact.

The absolute easiest way to contribute something is to fork the repo, and add
your name and email to the "contributors" section of package.json, and then
issue a pull request. If you're not familiar with GitHub, this will be a good
way for you to learn the basics.

We make use of GitHub issues to keep track of [what work needs to be
done](https://github.com/dattnetwork/datt/issues), which for now is mostly
backend software work. Not all TODOs are necessarily listed on the GitHub
page--only near-term problems to be solved are there. Some big picture items
are not necessarily on the issues page. In other words, don't hesitate to
contribute something that isn't listed explicitly on the issues page. On the
other hand, if you're looking for some way to contribute, tackling an issue on
the issues page is a good way to get started. Also feel free to add your own
issues to the issues page.

We look forward to your contribution :)
