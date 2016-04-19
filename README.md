Yours Core
==========
Yours Core is a decentralized content sharing platform with integrated
payments. It is currently undergoing heavy development and has not yet reached
alpha. [Our issues are tracked on
GitHub](https://github.com/yoursnetwork/yours-core/issues).  Check out the
[blog](http://blog.yourscore.co) or
[twitter](https://twitter.com/yoursnetwork) to stay up-to-date on progress.

How To Test And Develop Yours Core
----------------------------------
Yours Core can be built and run on Linux. It is not tested on Mac or Windows, but
should work with minimal or no changes on those platforms. To help program the
Yours Core application, first be sure you are running node 4.3:
```
> node --version
v4.3.1
```
Then clone this repo:
```
git clone https://github.com/yoursnetwork/yours-core.git
```
Then install the dependencies:
```
cd your-score
npm install
```
To run all of Yours Core tests:
```
npm test
```
To build the browser bundles:
```
npm run build
```
Then run the server:
```
npm run serve-testnet
```

This will serve the files and run a browser-sync proxy server (If for some
reason you wish to run in dangerous mainnet mode instead, replace 'testnet' for
'mainnet' above). You can then access the tests at:

```
http://localhost:3040/tests.html
```

The app makes use of IndexedDB in a browser. Each "domain" has its own
IndexedDB. This means if you run the app on a different port, it's as though
you're running the app as a different person from a different computer. To
facilitate this for testing purposes, the ports 3040 - 3044 are all assigned to
simply deliver the app. So feel free to open up these other ports to see the
same app but with a different user:
```
http://localhost:3040/
http://localhost:3041/
http://localhost:3042/
http://localhost:3043/
http://localhost:3044/
```

Folder Layout
-------------
This repo contains both the main yourscore application as well as the landing page,
blog, documentation, mockups and other media, and a second unfinished UI. The
folders are as follows:
- bin/ - Executable files, particularly for running the app servers.
- blog/ - The blog content and source.
- build/ - Static files and build files for the browser.
- docs/ - Documentation on business, product, community, technology.
- landing/ - The landing page content and source.
- lib/ - The core logic of the database and API.
- media/ - Logos, mockups, and template HTML.
- server/ - The Yours Core servers.
- test/ - Tests for yourscore.

Environment Variables
---------------------
- `YOURS_CORE_JS_BASE_URL` - Default "/". The public-facing URL where the javascript
  files are hosted, usually either "/" or "/js/".
- `YOURS_CORE_JS_BUNDLE_FILE` - Default "yours-core.js". The Yours Core bundle file.
- `YOURS_CORE_JS_TESTS_FILE` - Default "yours-core-tests.js". The tests file - where the
  browser tests are located.
- `YOURS_CORE_BLOCKCHAIN_API_URI` - Default "https://insight.bitpay.com/api/".
- `FULLNODE_NETWORK` - Default "mainnet". Can also be "testnet".
