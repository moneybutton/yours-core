---
title: End of Week Four
author: ryanxcharles
date: 2015-08-29
template: article.jade
---

This week, the most development of Datt has occured in our p2p
protocol/application datt-node. I pulled in Willy's expansive work creating a
content store around PouchDB that abstracts a mongo-like database on top of
leveldb (node) and IndexedDB (browser), along with a bunch of feature additions
and tests. And Willy pulled in my work on AsyncCrypto that now uses workers
correctly, so that our cryptography does not block the UI or IO. All of this
code can be seen in the [datt-node
repo](https://github.com/dattnetwork/datt-node).

We're still aiming to have a prototype finished by September 10. This timeline
is going to be very tight. My schedule has been occupied with a bunch of meta
work, particularly meetings, calls and emails. I will need to clear my schedule
and focus almost completely on programming if we're going to have a prototype
by September 10.

The goal of the prototype is to merge our design work in the [dattmedia
repo](https://github.com/dattnetwork/dattmedia) into our UI in the [datt.ui
repo](https://github.com/dattnetwork/datt.ui), and then to finish our p2p
protocol in datt-node, and merge that into datt.ui as well. There are some
significant hurdles left before all these pieces can be fit together. Although
we have the basics of the p2p protocol ready in datt-node, its interface is not
yet ready to be used by datt.ui. Also, we have not integrated bitcoin payments
at all in any form.

Our priorities for the prototype are:

1) Add an EventEmitter interface to datt-node that gives access to the basic
features of datt-node. It should be possible to sign up as a new user, post
content, and retrieve content by connecting to and sending messages to/from
peers.

2) Add an abstract network interface that works in a browser (web RTC), node
(TCP, presumably), and browers <-> server (web sockets), so that browsers and
servers can coexist on the same p2p network.

3) Add basic bitcoin wallet features to datt-node. datt-node should have a way
to tip the author of content. We don't need to use payment channels yet - just
normal bitcoin transactions will do for a prototype.

4) Integrate datt-node into datt.ui and make the UI use the datt-node
interface. All the application logic should be contained in datt-node, and
datt.ui should serve to map the UI to the features of datt-node.

5) Integrate the dattmedia UI mockups into datt.ui.

6) Add a bitcoin full node to the main [datt
repo](https://github.com/dattnetwork/datt), and then add datt.ui as a
dependency. It should be possible to "npm install" datt and have a full datt
node with datt.ui as a front-end. It is OK if the user has to manually install
a bitcoin full node for datt to work. The easiest bitcoin full node to use for
now is probably btcd, since that has an address index feature. We will want to
replace this before MVP, since btcd is not known to be protocol-equivalent to
Bitcoin Core, however it works fine for a prototype.

The goal of the prototype is to build something demoable, but not solve every
problem. I'm assuming we will take a few short cuts for our prototype,
including not putting SPV in a browser. If necessary, we can take even more
short cuts to get to a prototype. The prototype needs to be able to have two or
more users connect to the network, post and receive content, and tip each
other. If certain features are missing or broken, that's fine, so long as we
can demo the basic functionality.

This week was my first full week working from IDEO. I am an experimental
"Entrepreneur in Residence" at IDEO Futures. We don't have a formal
relationship yet, but we'll try to figure out what a formal relationship would
look like next week. Presumably that would be something where IDEO gets equity
in exchange for contributions to the company. IDEO is an ideal partner because
their skills and assets are so complementary to my own and to the basic
technology we are building. Ideally they will contribute to the design, product
and business of Datt, and will probably be extremely helpful in guiding our
project to be something great for a mainstream audience.

Next week I will be giving a presentation at IDEO about the project, and this
will be a good time to identify who else at IDEO might be interested in
contributing to the project. When I have some slides ready, I will share them,
and would love feedback before I give the presentation.

We now have a blog (which you are currently reading) hosted at
[blog.datt.co](http://blog.datt.co), which contains what was our "log" in the
[dattdocs repo](https://github.com/dattnetwork/dattdocs). I also now own
datt.net, although it is not yet being used for anything other than mirroring
the landing page.

Last week I mentioned that the launch of the prototype would be a good time to
take the next steps in advertising Datt. Darren has put together a nice outline
of [our marketing strategy should look
like](https://docs.google.com/document/d/1n61bW6JYmzLP0BQQUsFmVj5ilHKZ2S4QBAewKuH6xjo/edit).
Meanwhile, I interviewed with both Money & Tech and CoinDesk this week, so
there will be some news items about Datt soon. I don't expect these will grab a
huge amount of attention, although it will grab some. What will grab a lot of
attention is when we "launch" the prototype.

Last week we also put together [this list of long-term
goals](https://docs.google.com/document/d/1C9FNbS8GlQ6z5wwNXT2NsbWXPmSTDyVkl4MUmv6h770/edit),
mostly as a learning exercise, and as a tool we can use over time to analyze
our ability to make long-term predictions about this project and company.

In summary, we've made very solid progress on the core logic of our
application, but still have a significant amount of work to do before the
prototype is ready. We are sticking with the goal of September 10 for the
prototype. Once we have the prototype, we will have an easier time assessing
the difficulty of implementing the rest of the necessary features and will be
able to come up with a reasonable timeline for an MVP (which would be something
people could actually use). We will also be in a much better position to create
a company and raise money.
