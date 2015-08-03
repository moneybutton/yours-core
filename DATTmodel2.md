Another attempt at a DATT business model
=======================

### Premise
- Users upvote and gild posts - both of which pay in favor of the Author
- Authors post content and may also apportion some profit or attach a bounty - to incentivise nodes to propagate the content
- Mods curate listings of content into collectives - this benefits users who consume this listing, and also nodes that want to serve good content
- Nodes serve content in return for a portion of the bounty and upvotes to the Author - nodes in turn reward the Mods/Collective that curated the content

### Perspectives of participants

#### From the perspective of a Node:
I'm listening on the network and it's all noise - I need to decide which content to serve/propagate. I could just serve content that is trending or already has lots of votes, but then I'm just one of a crowd of nodes chasing the same content. So I choose to subscribe to a collective, perhaps this is a collective that meets some metrics I'm interested in, or simply one I'm preconfigured with. I establish a payment channel with the collective so it will feed me with listings. I focus on propagating the content to more and more users. It seems users like some of the content I served them because I see plenty of upvotes for the content. As the upvotes flow in, there is a growing bounty attached to this content, most will go to the author but some is apportioned to nodes like me. Since I was in early I have a larger portion than those other nodes that joined the party after me. I just have to keep serving this content and I'll get my dues. I haven't forgotten the collective that gave me the heads up that this was good content, so I'm fairly likely to stay subscribed and I can subscribe to other collectives at any time.

#### From the perspective of a Mod (running a Collective):
I'm pretty keen on politics, and there are a boat load of users who post about politics, they tag their posts "/politics" and I read most of them. But there are a lot of off-topic posts so I have my Collective listing politics posts excluding those I deem as off-topic in my opinion. My collective listing is "/politics - /politics-off-topic" and I keep things pretty tidy. Users have set their clients to periodically retrieve my listings, I don't care whether they do so in order to create their own listings or to filter out my listings, I just know that they request listings and I give it to them within a certain rate limit. Nodes are a bit different, they subscribe to my collective and want to have a web socket so I can tell them about new content as soon as it's listed. Nodes can earn some serious coin if they get in early on good content, so I adjust my subscription fee to find the right balance between what Nodes are willing to pay for my listings and how much I'd like to earn for my work as Mod.

#### From the perspective of an Aggregator (running a Collective on top of other Collectives):
Picking good collectives out of the flock takes a fair bit of analysis, but given enough data you can start to build a picture of the information flows and where the valuable content originates. I'm keen on tapping into that value chain by providing an aggregate of several smaller collectives. I subscribe to the smaller collectives just like any other node, and I in turn have nodes that subscribe to me. As long as I charge out more than I'm paying to smaller collectives I'll turn a small profit. Users seem to like my collective because it's easier for them to get a larger set of listings from me than from a dozen smaller collectives. I've got a tipping address so it's always appreciated when users tip.

#### From the perspective of an Author (regular):
The internet is full of amazing things and I post links to them as soon as I find them. It's awesome that I can express myself in this way. I'm not doing it for love, but it sure feels great when something I've posted gets a lot of upvotes. And here's the kicker, those folks who upvote my post do so with a micro payment, yep small amounts that can build up to be a fair chunk of coin if there's enough votes. I know that in order for this to happen my content needs to propagate across the network so people can discover it easily. The better propagated my content is, the more collectives will list it, and the more nodes will serve it. So it makes sense that a portion of the initial profit from upvotes goes to the nodes that are serving the content. It doesn't make too much difference how many users they serve it out to, rather it's how early they got in and started serving, and that they are continuing to serve my content. If I didn't apportion something to nodes then it would be crickets around here, and someone else will probably have posted a link to that amazing thing.

#### From the perspective of an Author (sponsor):
I'm affiliated with a brand, and they want to get the word out about their awesome new thing. I could just post a regular link to it and see how the content does on it's own, but I know users are exactly clambering to find contents from brands unless it's a brand they already know and love. So I break the ice a little by attaching a bounty to my post. This gets the content propagating fairly quickly across the network as the nodes want a share of the bounty. Nodes are going to get paid a portion of the bounty, but they're not going to stick around very long if my content doesn't also start getting some upvotes. If the upvotes start flowing in then it's win-win for me and the nodes - If they don't then the nodes walk away with a portion of the bounty and leave me hanging. I'm going to be wondering was it the quality of the content, was my bounty sufficient, or should I have apportioned more to the nodes.

#### From the perspective of a User (votes & gilds):
I engage with authors in a way that signals my opinion of their posts. I'm fairly liberal in upvoting posts I like. When I see a post that is useless/off-topic/i-just-hate then I'll downvote it too. Voting up or down costs such a tiny amount that I don't really give much thought to the cost. I like that Authors get rewarded for posting good content because it encourages them to post even more awesome content. Sometimes an author shares something mind-blowing and I want to give them a big high five, so I gild them a bigger chunk of change and it goes straight into their pocket not some corporate middleman. What's equally awesome is that my client also acts as a node, it'll propagate posts if I tell it to, so I'll occasionally get in and have my node earning a portion of the profit on a post, which is a neat way to top up my balance.

#### From the perspective of a User (lurks & comments):
Each day I'd spend at least a few hours reading the internet, it's a great time killer. I'll always scroll down to the comments because that's where the action really is, I might not have read the post, but I'll get a gauge of the comments and probably chime in with my own opinion too. Comments are freedom of expression and there's usually conflicting points of view, so I try to make my view heard clearly. Sometimes other people rally behind my comment, upvote it, and reply to it. Often my comment just rests there as a part of the discourse. Other times my comment might have irked people so they downvote it, but I don't really care. I can't comment without a balance because each comment commits a small amount in a payment channel, I'll get these funds back after a set time so I can keep on commenting. The thing is, if my comment was downvoted a lot then I'll only get a percentage of the funds back, it's only a tiny amount but I still try not waste comments or troll cause then I'd need to top up my balance more often.

#### From the perspective of a User (votes on comments):
I like the discussions and discourse that rises up around posts. A good healthy debate often arises and allows people to express different perspectives. But I hate it when people try and troll in the comments. I'll often downvote comments that are trolling or just sucking oxygen. Most users don't display comments below a threshold, so it's nice to know that useless comments will not get attention. On the flipside, I often upvote comments that deserve to be seen even if I don't always agree with their perspective. Voting on comments costs such a small amount (heaps less than voting on posts) so I don't give it much thought and just top up my balance by a few bucks every few months.


### Variables
- The cost to vote on posts (5mBTC) and to vote on comments (5,000 satoshis) are the only fixed variables.
- Authors determine what portion of profit from upvotes they will share with nodes and over which time period.
- Authors can put forward a bounty on their content if they desire.
- Gild amounts are completely up to the user doing the gilding, and the whole gild will go to the author.
- Collectives decide what to charge Nodes that subscribe to their listings.
- Collectives decide what rate limit they will enforce for clients requesting listings.

**Example:**
1. An Author publishes a post without any bounty, but does include a generous 40% portion for nodes that are propagating the post in the first 60 minutes
2. The post was tagged with /lolcatz and was picked up a Mod at the collective /funny
3. The collective /funny has quite a few nodes subscribed so the content propagates quickly
4. Nodes are paying /funny 1000 satoshis per new listing
5. Within the first 60 minutes there are 500 upvotes cast equating to roughly \$700, 40% of which is apportioned to the nodes according to their seniority
6. Another 800 upvotes are cast afterwards which is another roughly \$1100 to the Author
7. Some users gild the author with amounts ranging from \$20 - \$50

**To be determined:**
 - where do votes on comments pay out?
 - where do comment commitment funds go if they aren't returned to the commenter?
 - where do down votes on posts pay out? (do we need down votes?)