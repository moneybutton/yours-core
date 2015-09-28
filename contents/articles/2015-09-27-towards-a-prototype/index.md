---
title: Towards a Prototype
author: ryanxcharles
date: 2015-09-27
template: article.jade
---

After spending about a week working on the [the master
plan](/articles/2015-09-18-the-master-plan/), I am now dedicated completely to
finishing a prototype. I think a realistic goal is to have something done by
mid-November. Note that the purpose of the prototype is to have something
demoable, not to launch to the public. The MVP is what we launch to the public.
The MVP will ideally follow soon after the prototype after we factor in what we
learn from demoing the prototype.

Unfortunately, the YC deadline is October 13 and LAUNCH is October 18, both of
which are earlier than I would prefer. I think we will be in a pretty immature
state to apply at those times. However, I believe we should apply anyway. As
such, I will be doing what I can to finish the prototype by then.  While not
strictly necessary, I believe the prototype will be a huge asset when applying.
Therefore, although this will be very difficult to pull off, my goal is
actually to finish a prototype by October 10, and "launch" the prototype before
submitting a YC application.

I've talked with a few people interested in being cofounders, possibly for the
YC application. However, right now, I'm trying to spend as much time as
possible building the prototype. So for those of you who are interested in
this, let's revisit those discussions shortly before applying.

Here are some points in roughly chronological order about what I've done,
mostly in the past week, to get to a prototype:

- Since node.js 4.0 was released, I made everything work in node 4.0, and
  switched [datt-node](https://github.com/dattnetwork/datt-node) from
  [bitcore](https://github.com/bitpay/bitcore) to
  [fullnode](https://github.com/ryanxcharles/fullnode). fullnode has most of
  the features of bitcore but with a better interface, and is written in ES2015
  (which is just nice), and I control it, so it is easier to get changes and
  fixes into it for the purposes of datt.
- I made a new front-end in React called
  [datt-react](https://github.com/dattnetwork/datt-react). It is not as
  complete as the Ember front-end, but I think React is both easier to use and,
  now that React Native works on Android (in addition to iOS), will get us on
  mobile more quickly.
- After working on both datt-node and datt-react at the same time, I realized
  how cumbersome it was to maintain and develop on two separate repos. So I
  have merged both datt-node and datt-react together into one repo,
  [datt](https://github.com/dattnetwork/datt). Note that the front-end (the
  react code) and back-end (the p2p and database, which run both in node and
  browsers) are still logically separated - just merged into the same repo. The
  Ember UI can still be used if desired, just with datt rather than datt-node.
  The reason we didn't do this earlier was because the Ember community prefers
  to keep front-end repos separate - but that issue is not relevant for the
  React front-end.
- I have datt-node initializing correctly in datt-react. i.e., the application
  logic is now hooked up to the UI, which actually hadn't been done already.
  When you run the UI, datt-node is used to automatically create a new user.
- I have renamed datt-node to datt-core. Although this logic is now contained
  in the main datt repo and not in a separate "datt-node" repo, it is still
  logically separate, and gets built to a file called datt-core.js. This is
  because too many things were called "node" (node.js, bitcoin node, fullnode,
  datt-node).
- I have rewritten much of datt-core. The database is hooked up, but most of
  the content logic and p2p connections have not been re-merged or re-written,
  so those are top priorities moving forward.
- I spent a huge amount of time getting builds working well for datt. Datt has
  some unusual features that make it difficult to build properly:

  - It is written in ES2105 and therefore requires babelify for browsers.
  - It uses web workers and those require a separate build process with
    separate built files.
  - The 'backend' must both run in node and in a browser.

  All these problems are basically solved. Plus one other cool thing: I have
  "watch" working both to watch the node tests as you develop ("gulp
  watch-test-node") and automatically rebuild the files and refresh (with
  browser-sync and watchify) the front-end so you can immediately see changes
  both in front-end tests and in the UI ("gulp serve").

Some priorities moving forward to finish the prototype:
- Let the user choose a username.
- Implement each message type with tests.
- Put the p2p connections back in and add logic around sending/receiving the
  messages.
- Add content back to the database.
- Finish a minimalist UI with React.
- Add Chris' design work to the UI.

The prototype will not have every feature and will not have a fully-working UI,
but still should be pretty usable and look reasonable. It should be good enough
that it is possible to record a video of using it that can be shown.

Here are some links on React, gulp, watchify and browsersync I've used:
- [Getting started with React and node.js](http://blog.yld.io/2015/06/10/getting-started-with-react-and-node-js/)
- [React native for Android and iOS](https://facebook.github.io/react-native/)
- [React example](https://github.com/yldio/react-example)
- [Facebook's tutorial on React](https://facebook.github.io/react/docs/tutorial.html)
- [Why you might not need MVC with React](http://www.code-experience.com/why-you-might-not-need-mvc-with-reactjs/)
- [Thinking in React](http://facebook.github.io/react/docs/thinking-in-react.html)
- [React automatically binds methods in its components](https://facebook.github.io/react/blog/2013/07/02/react-v0-4-autobind-by-default.html)
- [React.js Tutorial Pt 1: A Comprehensive Guide to Building Apps with React.js](http://tylermcginnis.com/reactjs-tutorial-a-comprehensive-guide-to-building-apps-with-react/)
- [React.js Tutorial Pt 2: Building React Applications with Gulp and Browserify](http://tylermcginnis.com/reactjs-tutorial-pt-2-building-react-applications-with-gulp-and-browserify/)
- [Rethinking best practices](http://www.slideshare.net/floydophone/react-preso-v2)
- [React.js and browserify workflow](http://christianalfoni.github.io/javascript/2014/08/15/react-js-workflow.html)
- [Fast browserify builds with watchify](https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md)
- [What is browsersync and how do you use it?](http://damonbauer.me/browsersync/)
- [browsersync and gulp](http://www.browsersync.io/docs/gulp/)
