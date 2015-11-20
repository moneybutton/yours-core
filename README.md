Datt
====
Datt is a decentralized community platform with integrated payments, a way to
pay for and be paid for content, a solution to the incentives problem of social
media, and an app that runs in node.js and web browsers. Datt is currently
undergoing heavy development and has not yet reached alpha. [Our issues are
tracked on GitHub](https://github.com/dattnetwork/datt/issues).

---------------------

To develop on Datt, first clone this repo, then ensure you are running node
4.2, then run:
```
npm install
```
From inside the repo.

To run all of Datt tests:
```
npm test
```

To run only the node tests:
```
npm run watch-test-node
```

Then save a file and the tests will run.

To run only the browser tests:
```
npm run serve
```

This will serve the files, run the PeerJS rendezvous server, and run a
browser-sync proxy server that will automatically refresh your browser when the
files change. You can then access the tests at:

```
http://localhost:3040/tests.html
```

Or access the app itself at:

```
http://localhost:3040/
```

The file layout is as follows:
- bin/ - Executable files, particularly for running the app servers.
- blog/ - The blog content and source.
- build/ - Static files and build files for the browser.
- core/ - dattcore - The "core" logic used in servers and clients.
- docs/ - Documentation on business, product, community, technology.
- ember/ - The Ember UI, currently unmaintained.
- landing/ - The landing page content and source.
- media/ - Logos, mockups, and template HTML.
- react/ - dattreact - The React front-end.
- test/core/ - Tests for dattcore
- test/react/ - Tests for dattreact
