# High-Level data-models

This is a high level overview of data structures that will make up the user experience.

It is a work in progress to be informed both by our P2P development efforts and our UX design.


## Thing

Every thing is identified by a unique pubkey/address.

Clients that contribute a thing are responsible for storing the privkey.

The data for a thing is an arbitrary JSON data blob signed by this key.

The score of a thing is based on blockchain value. In this way the blockchain manages tracking karma/reputation/internet points.  Yes this means voting/karma is a scarce resource.

Things should also function with P2SH addresses in addition to standard pub/priv keys.

## Listing

Listings are Things that track a collection of other things.

The client will facilitate the composition and sorting of listings based on age and blockchain value.

How these listings are stored will be determined by how we approach Content Propagation.  It may be possible to store listing data on the blockchain.

It should not be possible for anyone to remove a thing from a listing, only add.

# Extended Data Structures

These are Things and Listings given extra meaning by client convention.

## Handle

A handle represents a less anonymous individual within the WWL.

It includes a human readable (nick)name and optional data about associated links, comments and collectives. Possibly some sort of profile/external contact data as well.

## Comment

A comment has a body of text and an optional parent thing. It may be associated with a handle. Comments should support optional cryptographic signatures. The OP of a Thing could comment on that thread and prove their identity as the OP by signing comments with the Thing’s key.

## Collective

A collective represents a collection of things within the WWL.

Collectives specify multiple listings and the set operations to combine them into a coherent curation.

For example consider a simple Collective which allows anyone to contribute and has two “moderators” Jack and Jill who remove off-topic content.

This is achievable using three Listings

 * An open access (shared private key) Listing for submissions
 * A listing owned by Jack that tracks content he deems off topic
 * A listing owned by Jill that tracks content she deems off topic

The content curation of this community would be defined as:

    L1 – (L2 + L3)

Each collective should be able to specify its own listing logic.  A collective does not have to be associated with any Handle.

The moderation listings are necessarily public, but there is no requirement that they be linked with any Handle. Jack and Jill may remain anonymous but their curation will always be transparent.

Additionally, clients may clone/fork the Collective to add/remove Listings to customize the viewing experience for themselves and others.

By labeling Listings and organizing flagged content into those labels it gives readers more control to dictate their own experience. The client should faciliatate this style of category based moderation as much as possible.

Collectives are intentionally generic structures that should be useable to implement many diverse community styles.
