Architecture
============

Preliminary thoughts on the architecture of the datt application.

Datt is primarily designed to have a web interface. The backend and frontend
are written in javascript. The backend may be rewritten in a different language
at a later date, but for now writing everything in javascript is the easiest
way to share code between server (backend) and client (frontend).

A datt node connects to the datt p2p network. A node can authenticate with
other nodes, broadcast new data, download data, and relay data. The data
primarily consists of the text content of posts and comments as well as
actions, such as proof-of-payment for upvoting or downvoting.

The frontend will focus as a "light node", since technically not all behaviors
can be performed from inside a web browser, particularly serving as a
rendezvous server or connecting to the bitcoin p2p network. However, a light
node serve and relay data using IndexedDB and web RTC.

## Full Node

A node connects to other nodes via tcp, and communicates using the datt p2p
protocol. It is possible we will adopt an existing protocol if one is suitable,
or we will create our own.

A node stores data in a database. Counterintuitively, the best database is
probably leveldb, not a relational database, because we need to make sure the
same basic functionality is possible in a browser, and browsers do not have
relational databases. They do, however, have IndexedDB, which works very
similarly to leveldb.

The database primarily stores user content and actions. All content and actions
are signed, and can be addressed by hash. Thus the database mostly consists of
keys that are hashes and values that are content. There will also be some meta
data to help find some content more easily rather than directly by hash. All
the data will need to be organized in key/value fashion, since leveldb is a
key/value store.

The primary interface of the full node is the p2p protocol. For MVP, there may
or may not be other interfaces, such as a REST or RPC interface.

Besides TCP, the full node will also need to be able to communicate over web
sockets so that web browsers can make use of the p2p protocol. Web browsers do
not support normal TCP connections, so web sockets, which behave similarly,
take its place.

The full node will also need to run a bitcoin full node. Thus, there are two
"full nodes" here - one is the "datt full node" and one is the "bitcoin full
node". The bitcoin full node is necessary to send and receive payments in a
decentralized manner. Which "full node" we are talking about will be clear from
context.

The full node will also need to serve as a web RTC rendezvous server. This is
to enable light clients to find each other for p2p connections.

The full node also contains the web client and will serve it on a normal HTTP
interface.

## Light Node

The light node runs in a web browser. It is possible that in the future we will
have mobile apps that act as light clients that are not written in javascript.
However, we are focused on web technologies only at the moment.

The light node may be run independently of any full node. It is a
self-contained javascript application. However, most users will probably access
the light node by visiting the URL of a full node and downloading the web
client.

The light node can connect to full nodes using the p2p protocol over web
sockets. The light node will be able to find other peers to connect to and
download data. Because web sockets can connect cross-origin, it is possible for
a user to connect to multiple unreleated full nodes on the normal internet.

A light node can also connect to other light nodes using the p2p protocol over
web RTC. The light node will register itself with one or more rendezvous
servers for this to be possile.

## Bitcoin

There is a difference between the bitcoin p2p network and the datt p2p network.
Payments are sent over the bitcoin p2p network, and content is sent over the
datt p2p network. Each datt full node is also a bitcoin full node, and will
provide access to the bitcoin p2p network. For simplicity, we keep these two
p2p networks as completely distinct, and each requires separate connections.
Thus, each node will actually connect to each other twice. Once for bitcoin,
and once for datt.

In order for light nodes to operate trustlessly, they need to run a bitcoin SPV
node in a web browser. This will operate similarly to the way the datt p2p
protocol does. Light nodes can connect to a bitcoin full node via a web sockets
gateway. However, there is no point in light nodes connecting to other light
nodes if they are SPV, since SPV nodes do not provide services to other nodes.
A node cannot download transaction data from an SPV node. Thus, there are no
web RTC connections for the bitcoin SPV nodes.

Furthermore, in order to make micropayments possible, we will need to implement
the lightning network or something similar. This adds an extra layer of
complexity for the bitcoin nodes. We have not considered the technical
implications of this in detail.

## Simplifications and MVP

The technical solution outlined here is complex, and it may not be necessary to
implement all of these features for MVP. Some possible simplifications:

- Start by only implementing the light node, and all connections are over web
  RTC.
- Start by implementing only the full node, and the "light node" operates by
  trusting the full node.
- Do not implement lightning network. Instead, use normal bitcoin transactions.
