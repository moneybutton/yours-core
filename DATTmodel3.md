@aramkris's business model
=======================
User Experience is the Key to making this happen. 

Business Model Canvas
----------------------------------
Customer Segments
(Who are we creating value for?)
-	Internet users
-	Advertisers/marketers & Sponsors of content
-	Developers
-	Anyone who cares about anonymity and censorship

Value propositions
(What value do we deliver to the customer?)
-	Incentivize good content generation thru’ direct monetization options
-	Ability to express oneself without any censorship (limited by Node though other nodes can host the same content)
-	Connect with the network and discover new things, share, vote and comment
-	Have a social context and engage with like-minded people
-	Personalize the interactions within limited groups, if necessary
-	Search the content (assuming the content creator allows it). In certain cases, the content creator might want to restrict access to search to keep things relatively private.
-	No requirement for registration with the network. But, usage of the key-pair will serve as identity on the network.
-	If the user/creator pays the network for publishing/access then they remain anonymous unless they want to identify themselves. 
	o	This can be very useful for political issues.

Channel(s)
(How do we reach our customer segment(s)?)
-	Desktop application and a mobile application (http(s) website would be challenging)
-	Tools and APIs
-	Sales channel to forge relationships with large publishers and going forward academic and for-profit organizations.

Customer Relationship(s)
(What type of relationship do our customer segment expect?)
-	We are making a multi-sided platform here.
-	Same side and cross side network effect(s)
	o	Note: Both of these require Two-sided network effects to be in operation.
	o	Same side network effect: If content creators start publishing in the network, then it will pull other 
content creators so that they don’t lose out on the opportunity and vice-versa.
	o	Cross side network effect: If content creators start publishing in the network, then more users might start accessing the network and vice-versa.

Revenue Stream(s)
(What value are our customer(s) willing to pay for?)
-	Payment revenue
	o	User(s): Freemium model
			Pay a minimum fee to access content
			Pay to Vote or vote on comment(s)
	o	Creator(s)
			Pay the moderator(s) for their service(s)
			Indirectly pay the network as the moderator pays the network
			Receive direct payment(s) from the User (thur' the DATT network or directly to the wallet)
	o	Moderator(s):
			Get paid by the Creator for services
	o	Node(s) & Protocol usage:
			Gets paid by the moderator
-	Sponsored content 
-	Advertising revenue can be an option depending on what a Node want(s)
	o	Let’s say a node is ready to serve content for free and in exchange will sell ads to its users
	o	This will be challenging as the advertiser will not know about the audience they are serving.
-	Sale of the protocol for a school, college or corporate set-up
-	Integration of other application(s)
	o	For example, creating a secure content sharing platform which can be used inside a school or college or corporate might require integration with other applications used in those scenarios. For example, a school scenario might require integration with their classroom application. 

Key Resource(s)
(What key resources are required for our value proposition?)
-	DATT Protocol
	o	Platform for the protocol to function
	o	Ability of protocol to operate in a constrained environment like school, college or corporate set-up
-	Integration with Bitcoin 
-	Technology infrastructure to bootstrap the initial few node(s)
-	Integration with other service(s) to handle ownership, IFFTT etc.

Key Activities
(What key activities do our value proposition require?)
-	Development of the protocol and platform
-	Creation of a suitable UX to ensure that the cryptography principles which are key to the network are hidden suitably.
-	Operations management from a technical perspective to ensure Moderator(s), Node(s) etc function properly
-	Bootstrapping node/node(s)

Key Partner(s)
(Who are our key partners?)
-	Content publisher(s)
	o	All types of content but in the order of Text, Audio and Video.
-	User(s)
	o	They are a key partner for this network as content access does not come for free. So, we need good user(s) also to start with. This is the only way the value of the network will go up.
-	Moderator(s) - Indirectly
	o	Content curation will be an important part of building the network. The better the moderator(s) are more nodes will want to work with them and more content publishers will go with them.
-	In the future, universities and other institutions which might want to promote uncensored content will become partners.

Cost Structure
(What are the important costs inherent on the business model?)
-	Protocol/Platform development costs
-	Bootstrapping the initial few node(s)
-	Marketing to get content publishers and users to start using the platform
	o	This might involve paying the initial users and content publishers to use the platform
-	Research and development for further enhancement(s) of the platform
-	General administrative expenses

Competitors
(Who are the competitors?)
-	Centralized Social Networks like Facebook, twitter etc
-	Decentralized Social Networks like Synereo, Aether, peerSon etc can enter this space in future.

------

Functional, technical and Operational models
-------
Notes: 

- There are 3 Major player(s) in this P2P Network. Creator <-> Collector/Commentor/Audience <-> Connector/Share (arrow back to creator). 1 & 3 provide the value addition; 2 & 3 help in passing information and content; 3 helps in growing the network along with 1 who might be able to provide better content.
- Node: Any computer (server or a simple desktop) that hosts content and allows itself to participate in the network. Nodes provide rights to the network to store data (to the extent allowed) on the local hard drive.
	- Full Node: Allows creation, consumption and sharing of all content created everywhere in the network within its set of rules.
	- Restricted Node: Allows creation and sharing of content created by the specific node. Consumption of all content is also allowed. 
	- Simple Node: Allows consumption of content for the chosen topics. 
	- Blocking content: This type of content is blocked from being accessed from a node. Other node(s) can still allow this content. 
	- Reject content: The type of content is rejected by a node and will not be hosted by it. 
	(Difference between Blocking and Rejection: For example, content which involves information on politics can be accepted by a node, but specific comments which follow that might not meet the rules 		required. So, these comments can be blocked by a node. However, the original content is still available. In case of rejection of content, the node will not host anything on that specific topic(s).)
- Information cache: Information stored locally by the application. The information present when the application exited will be stored as it would provide better context to the network with the application comes online.
- Content: Any information (article, link, media etc) that is submitted to the network. The person submitting this information is the creator.
- Comment: Subsequent information added to submitted content by a user different from the creator.
- Additional information: Additions or updation of the original content submitted by the creator. This will update the original post. (Still thinking about this as if we lock the post with a hash, then changes would lead to violations) <End of Notes>

#### Protocol
  - Needs to be minimal
  - Good & consistent sync of comments, votes and content apart from information on moderation etc while assuming that packet losses in the network are inevitable. Bittorrent P2P network like reliability.
  - Manage bandwidth efficiently
  - Node discovery should be easy"
  - How to find other nodes?
  - Auto propagation should be possible within the realm of what the node allows
  - Should fundamentally integrate sharing with bitcoin when accessing content

#### Application (Mobile, Web) - Functionally

  - Connect to the P2P network
  - Download the list of topics of interest
  - Store the content locally (as desired)
    - Maybe there can be options to do this inside and outside the app with and without payment
  - Integrate with other social media apps
    "Have the ability to share with twitter, facebook etc."
  - Ability to vote
  - Ability to read comments inline in the app itself
    "I feel this is a difficult problem to solve as the current method of reading comments is terrible. Either we lose perspective of the comments when someone has provided a specific answer or we lose context of the main content."
  - Needs to integrate with
    - Reference/Academic sites (arxiv or academia or even the Alexandria project)
      - The Alexandria project would be good to have as good content available on Alexandria can be made available to a larger audience thru' this mechanism
    - Bitcoin network
  - Web App
    "Needs to be thought through as the keys need to be shared or at least authentication of a mobile app needs to be shared with a cloud based application"
    - Minimal cloud based solution should be available
  - Moderator Setting: Can it have the ability to deny access to specific node(s) or specific user(s)?
  - Maybe the application can also provide an option to get information from a different full node 
    - Have a simple file where users can add information on full nodes manually, if required.
  - The application can also provide the content owner information on which full node is hosting his/her content.
  - It might be a good idea if we can let content owners know how many times the content has been downloaded. (??)
  - Moderation
    "Ultimate power should rest with the hosting node."
    - Allow competitive moderation? 
      - Nodes can get to choose who can be the moderators. So, if someone feels that nodes are refusing to host their content, then they can host a node and become the moderator.
    - Users can also choose moderators for specific articles/boards/subs, if possible

#### Node(s)

  "By default all nodes start as Restricted nodes.
  The node should be able to decide what to sync (type of content), when to sync, How much to sync, user level sync etc.
  Country specific sync would not be possible in this setup unless the P2P network posts get banned."
  - Full Hosting nodes
    "Read and Write client which also hosts information from others"
    - The network pays this node for hosting content
    - Block and Reject content
    - Keeps a local copy of all information
  - Restricted nodes
    "Read and Write client"
    - Gets paid a smaller amount for content creation
    - Can Block content for content created by the node
  - Simple nodes
    "Read Only client"
    - Only content consumption
    - Can neither block nor reject content; Will get the content provided by the full or restricted node to the extent it subscribes
    - Don't get paid

#### Manage content

  - Reward content
    - For creation
    - Comments which are upvoted beyond a certain point (This can be from the creator itself, if the creator feels the comment is valuable)
    - Pointing out mistakes (creator can step in)
    - Additional posting to the article which leads to better value
    - With subsequent posts linking to this the value of this post can increase (like Google's algorithm)
  - At this moment I would assume that anything other than child por* and terrorism promoting stuff should be allowed.

#### User?

  "Who is an user? There needs to be an authentication/registration mechanism wherein all the users are identified (if they want). This information need not be publically available and can be maintained in the blockchain."
  - Keeps hold of the same private key
  - Authenticated in the blockchain by usage of a private key so that if they have a username, they can keep it
    - This would come in handy for academic institutions and also for people who want to contribute and own content. Anonymity would not help if we are rewarding content.
  - Payments are received thru' the public key. the username can link to the public key.
  - Rating & reputation
    - Needs to be managed at a node and network level. This needs to be part of the protocol to sync.
    - Need to be discussed. 
      - Needs to be statistically managed
      - Use the blockchain to track any posts by the user (or think of something that can be left on the blockchain to check)

#### Revenue
(In addition to hosting revenue that a node will generate and what the creator makes)
  - Usage as a corporate Intranet
    "Use this network inside the company and let people subscribe to information. This can provide flexibility to people as not all information will be flashed when someone comes online. "
    - Secure board(s)/pages
    - easier discussions
    - Possibly use the space in the user hard drives which are terribly under used in today's corporate environment

#### Problem at this moment

  - Corporate interest wants to restrict content sharing and also dissemination of content against their policies(?) and interests
  - One point of failure and success
  - Do content owners get rewarded? For example, if someone posts a link to a paper or an article, the content owner may not even know.

#### Problem to be addressed

  - Balance between monetization of content and user freedom
  - Creators of content to get rewarded better
  - Why now?
    - Decentralization as a theme is picking up now as Byzantine generals problem and sybil attacks can be handled
    - General dissatisfaction with censorship and moderation at community sites
    - Opportunity to build something that will be ubiquitous like Bitcoin on top of the blockchain and value does not leave the blockchain
    - Social trend: People are looking for applications on top of the Blockchain and would be more willing to experiment. 
    - Financial trend: Bitcoin is currently at a market value of USD 4Bn. These applications can increase the value of the network as the content quality which can be used with the blockchain as the backbone can increase. This should lead to more usage and higher value of the network itself.

#### Application - Operationally

  - Connect to a P2P network (PK is known)
    - Clients can use the list of known nodes to come back online to the network. Or use DNS seeds or use IRC server(s). This will be very similar to what bitcoin clients do. (addrman)
  - Download topics that are being followed
  - View the topics and articles added to the topics
    - Add comments or vote on the articles
    - View comments
    - View votes (might not have much of an impact if this

#### Steps

  - Create the application which will enable creation & sharing of content 1:1 (more like P2P network)
  - Application should have the ability to let other users join the conversation
    - Boards should be present
    - Moderation comes into picture here
  - Voting 
  - Rating/Reputation management system
