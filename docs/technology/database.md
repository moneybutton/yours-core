Database
========

The goal of this document is to design a minimalist database for the datt
prototype.

A datt node (i.e., a node on the datt p2p network) can either be based in a web
browser or node (i.e., node.js). We have settled on PouchDB for the database,
at least for the prototype, which works both in web browsers and node. It is a
nosql database somewhat like Mongo. It is based on leveldb in node and
IndexedDB in web browsers.

The following pieces of information will need to be recorded in the database:

- content, which can be either a link or markdown text, and may refer to other
  content (i.e., a comment on another piece of content)
- actions
  - flagging content as inappropriate
  - payment proof for a piece of content
- bitcoin wallet information, such as utxos and the master xprv
- a log, for debugging

## Collections

Content and Actions
- Author public key
- Signature
- Hash of all that follows
- Parent content hash
- Label
- Latest block hash and height
- Bitcoin payment address
- Type ('markdown', 'link', 'flag', 'payment-proof')
- Body

Bitcoin Wallet Keys
- privkey
- pubkey
- address

Bitcoin Wallet UTXOS
- address
- utxo

Log
- date
- Short description
