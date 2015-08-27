---
title: End of Week One
author: ryanxcharles
date: 2015-08-07
template: article.jade
---
It's been one week since we started the hackathon and actually started working
on Datt. We've made some fundamental progress since the hackathon ended,
including further design work, further UI work, improved business plans,
improved community plans, improved architecture designs, improved p2p work, and
overall a more focused direction for the project. We also have a nice round
number of 100 users in the Slack channel - pretty good for one week.

I've talked with many people outside of the core contributors who are
interested in this project, including investors. Although we are not trying to
raise money at the moment, I've learned a lot about what we should probably do
to raise money. For one thing, the longer we can bootstrap, the better. The
more solid our prototype is and the more committed our team is, the better our
terms will be when we raise money.

On the note of outside interest, I'm in touch with several blockchain companies
that have expressed interest in hiring blockchain engineers. If you are a
blockchain engineer who might be interested in joining a company other than our
own, please contact me and I can put you in touch with these people.

I believe the path forward at this point is to focus on these core areas: 1)
Technical/Security, 2) Design/product, 3) Community, 4) Business. All of these
are key and should be weighted equally. The technical work is occuring in the
datt and datt.ui repos, design/product in both datt.ui and the dattmedia repos,
community in the dattdocs repo as well as on Slack, and business on the
dattdocs repo and Slack.

We're moving forward with implementing the core codebase in javascript. This is
the shortest path to market, but it has one drawback - cryptography is slow in
javascript, and arguably insecure to due timing issues (though that's
debatable). That is not a problem server-side, where we can link to C++ or C
cryptography. We can also make used of child process forks (node) and web
workers (browser) to ensure the networking and UI are non-blocking and
responsive. (Unfortunately, threads in node, though technically possible, are
not mature, and don't allow using C++ code, so that is not an option.)
Long-term client-side, where possible, we should to try hook into bitcoin
wallets and other services to offload some of the cryptography onto specialized
apps.

I believe our design and product work right now is very good and frankly better
than my expectations for  MVP.  The priority there should be to integrate the
graphical mockups into the datt.ui code. We also need a landing page. It's
possible I haven't thought of some important uses of design, so any designers
should feel free to do any other design work that they feel is appropriate. On
Aug. 18, I will begin working from the IDEO office. I'm extremely excited about
the possibility of a relationship with them.

The architecture will be with one repo for the UI, one for the node, and one
for putting the two together. That work is ongoing.

I believe we can target a mainstream community, although our core audience
consists of disaffected reddit users, the decentralization community, and the
bitcoin community. We should make sure our product services their needs first,
while ensuring the direction we take is compatible with going mainstream in an
iterative fashion. We need to create a plan for how to first service our core
users, and then how to expand outward.

We have several distinct business plans, but I believe the best is around
basically giving a cut of payments to the moderators and nodes. The First
Company aims to be the largest and best branded node, and will take a share in
revenue of tips and other payments. The payments are voluntary, because users
can route around the company. However, so long as the company maintains moral
authority (i.e., the users like us), I believe most users will not choose to
route around us. It is a key design choice that the users can route around us
if they so choose - I believe this will help build moral authority. We need to
refine our plans and prepare materials that is suitable for investors.

This week has been wonderful and I'm very please so many people have joined the
project. We have another mini-hackathon taking place tomorrow in Sunnyvale
(please contact Willy for details), and of course we will also be on Slack.
I'll be sure to bring a camera so that people who are online-only can possibly
join a Google Hangouts during the event.

I will also be personally contacting people working on the project to figure
out how you might like to be involved in the company, either at the level of
cofounder, employee, contractor, or other. I will begin that next week.
