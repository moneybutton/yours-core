dattcore
========
dattcore is the main logic of the p2p protocol, database, and API of Datt.
End-users do not use dattcore - only developers who are writing applications
that need to directly interface with a datt node will ever use dattcore.

dattcore is designed to run both in web browsers and in node.js. The p2p
connections are either Web RTC for browser <-> browser, web sockets for browser
<-> node, or web sockets for node <-> node. The database is either leveldb
(node) or IndexedDB (browsers). The workers are either child process forks
(node) or web workers (browsers). The need to make things work both in node and
web browser simultaneously and allow communication between them complicates the
architecture of dattcore. Nonetheless, most code is simply pure javascript that
runs in either place.
