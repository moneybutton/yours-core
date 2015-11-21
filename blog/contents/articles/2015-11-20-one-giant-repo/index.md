---
title: One Giant Repo
author: ryanxcharles
date: 2015-11-20
template: article.jade
---

After managing several different repos for Datt, including the blog, landing
page, documentation, media and others, I've realized it would probably easier
if everything were in [one giant repo](https://github.com/dattnetwork/datt).
The advantages are:

1. It's possible to make one commit that affects several projects, such as
updating code and documentation at the same time.
2. There is only thing thing to keep up-to-date about, making it easier to
track what happens across all projects.
3. It's easier to point beginners where to get started.
4. We can track issues for all projects on the same GitHub issues page.

The only potential cost at this point is that large binary files, like PSDs or
PDFs, might give the project a much larger filesize than desirable. However,
large binary files are pretty rare with Datt, so I don't think that will be
much of an issue.

Some related links:

- [Google has one giant repo](http://www.wired.com/2015/09/google-2-billion-lines-codeand-one-place/)
- [Facebook has a few giant repos](https://www.quora.com/Why-does-Facebook-have-so-much-of-their-source-code-in-1-giant-git-repo-did-they-not-think-that-this-approach-wont-scale)
- [Pro-monolithic versioning argument](http://danluu.com/monorepo/)
- [Anti-monolithic versioning argument](http://code.dblock.org/2014/04/28/why-one-giant-source-control-repository-is-bad-for-you-and-facebook.html)
