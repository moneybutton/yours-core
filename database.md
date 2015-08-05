Database
========

Each node stores a database. Presumably, web client nodes use IndexedDB. Since
this is a key/value store, the database should be designed around that notion.
Server-side (i.e., the "full node"), we can use leveldb. Note that one way we
could integrate ipfs or web torrent is for data to be redundantly stored on one
of those networks. If you know the hash of some data, you could get it from
ipfs or web torrent. Still, you will need a local database.

The simplest database for our purposes is:

- key: [hash]
- value: [content]

That's it. If we design the p2p protocol around this idea, that might be
sufficient.
