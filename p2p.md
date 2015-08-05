Datt P2P Protocol
=================

There are a lot of decentralized protocols we could leverage to build Datt. The
goal of this document is to design such a protocol. We may or may not use the
protocol designed in this document. If it turns out there is another protocol
that already exists that solves our problem, it would be better to leverage
that. However, such protocols may either not exist, or may not solve the
problem we have. This document can serve as a reference for what a protocol
would need to do to solve our problem.

Note that this protocol is nothing like bittorrent, and is a lot more like
bitcoin. This does not describe a protocol intended for use with a DHT. It is
not assumed there is global consensus about what content is on the network.
Each node can and will have a different set of content, although with a lot of
overlap between nodes. In order to download all content, a user would want to
connect to multiple nodes.

First, let's discuss the 'high level' protocol, which will be layered on top of
'low level' protocols such as TCP, web sockets and web RTC.

## Message overview

Basic messages:
- initiation message - send connection info
- init ack - send connection info
- post data - contains data to be posted
- get data - contains hash of data to be received
- request payment - contains payment amount and address
- send payment - probably contains actual bitcoin tx
- payment ack - just an ack of received payment

These messages are NOT final and subject to change, but just provide an
overview of what types of messages are probably needed.

The way this might work is you request data, but the node responds with a
"request payment", and to which you must send a payment before the data is
received. The "payment ack" may not be necessary, as you could just suddenly
receive data. The same goes with posting data. When you try to post, the node
responds with "request payment", to which you must respond with a payment
before continuing. This is similar to HTTP and their 402 error code. We could
consider just using HTTP as a messaging protocol, particularly HTTP 2.0 which
is binary and more efficient. However, that may be more complicated than we
need. We only need something very simple.

## Message Structure

[version][cmd][datalen][checksum][data]

- version: uint32, defaults to 0. The value should probably be ignored, but
higher values can signal to newer nodes to process data differently.

- cmd: 12 chars of command characters, similar to bitcoin. command strings are
followed by all 0s to fill the 12 chars.

- datalen: uint32, length of data to follow.

- checksum: First 4 bytes of sha256 hash of everything that follows (similar to
bitcoin).

- data: Binary data of  length datalen. interpretation of data depends on the
cmd.

## Signed Content

[pubkey][sig][datalen][data]

- pubkey: secp256k1 DER compressed pubkey, same as bitcoin, always 33 bytes.

- sig: "Compact" ECDSA signature of data; NOT the same as in the bitcoin
blockchain, but the same as bitcoin's "Bitcoin Signed Message" signatures (this
is just a more compact and easier to parse version of a signature). Always 64
bytes.

- datalen: uint32, length of data to follow.

- data: Arbitrary data of length datalen.

## ECIES encrypted content

[mac][pubkey_receiver][pubkey_sender][sig][datalen][data]

- mac: HMAC of data and the shared secret

- pubkey_receiver: compressed public key of receiver, always 33 bytes. receiver
doesn't have to be a person - maybe the shared public key of a channel, where
anyone knows how to derive the private key, e.g. it is the hash of the name
"science" for the global science subcommunity.

- pubkey_sender: the 33 bytes compressed public key of the sender

- sig: 64 byte compact ECDSA signature of data

- datalen: uint32, length of data to follow

- data: arbitrary data

## Tradle's work on p2p protocol

genevayngrib 8:19 AM @ryanxcharles: agree, p2p work is done by so many people!
Every multisig wallet needs it, other group sigs need it, lightning net needs
it! It is insane that we do not have a standard yet.

At Tradle we have spent a huge amount of time designing p2p protocol associated
with the blockchain and producing the associated OSS code. The basic ideas
are:-  all actions are associated with the identity of your choice. Identity
can be totally fake or verified by the government (as required on airbnb for
example). You can create as many of them as u like and all identities, their
keys and key restore/revocation as anchored on blockchain, so the chain is your
key server.

- p2p messages can be ephemeral or permanent. Permanent can be anchored to the
  public blockchain and not (anchored to local/federated chains, but for now we
  just use simpler logs)

- p2p  messages have open ended structure (json for now) and types of messages
  (models) are loaded from github or other web sites freely. These msgs can be
  new community, new post, upvote/downvote, moderator actions, etc. or could be
  verification of identity or any other stuff needed for the web of trust (or
  as keybase.io calls them - tracked identities)

- discovery of peers and topic should be 100% decentralized (we use a
  combination of identities on chain for finding verified pub keys and the
  bittorrent DHT for finding IP/Port of peers.

- peer discovery leads to a NAT traversal and UDP-based rUDP or uTP for
  reliable delivery of jsons over this line. Could support webrtc too of
  course, but does not yet. 
